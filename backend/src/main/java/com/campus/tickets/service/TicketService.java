package com.campus.tickets.service;

import com.campus.tickets.dto.TicketDTO;
import com.campus.tickets.dto.TicketStatsDTO;
import com.campus.tickets.exception.ResourceNotFoundException;
import com.campus.tickets.model.Ticket;
import com.campus.tickets.model.TicketComment;
import com.campus.tickets.repository.TicketCommentRepository;
import com.campus.tickets.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepo;
    private final TicketCommentRepository commentRepo;
    private final FileStorageService fileService;

    public TicketService(TicketRepository ticketRepo,
                         TicketCommentRepository commentRepo,
                         FileStorageService fileService) {
        this.ticketRepo  = ticketRepo;
        this.commentRepo = commentRepo;
        this.fileService = fileService;
    }

    // ── CREATE ──────────────────────────────────────────────────────────────

    /** POST /api/tickets — create ticket with optional images (max 3) */
    public TicketDTO create(String title, String description, String category,
                            String priority, String reportedBy, List<MultipartFile> images) {
        Ticket t = new Ticket();
        t.setTitle(title);
        t.setDescription(description);
        t.setCategory(Ticket.Category.valueOf(category.toUpperCase()));
        t.setPriority(Ticket.Priority.valueOf(priority.toUpperCase()));
        t.setReportedBy(reportedBy);
        t.setStatus(Ticket.TicketStatus.OPEN);
        if (images != null && !images.isEmpty())
            t.setImageUrls(fileService.storeFiles(images));
        return TicketDTO.from(ticketRepo.save(t));
    }

    // ── READ ─────────────────────────────────────────────────────────────────

    /** GET /api/tickets — list all with optional filters */
    @Transactional(readOnly = true)
    public List<TicketDTO> getAll(String status, String category, String priority, String search) {
        List<Ticket> list;
        if (notBlank(search))       list = ticketRepo.search(search.trim());
        else if (notBlank(status))  list = ticketRepo.findByStatusOrderByCreatedAtDesc(parseStatus(status));
        else if (notBlank(category)) list = ticketRepo.findByCategoryOrderByCreatedAtDesc(parseCategory(category));
        else                         list = ticketRepo.findAllByOrderByCreatedAtDesc();
        return list.stream().map(TicketDTO::from).collect(Collectors.toList());
    }

    /** GET /api/tickets/{id} */
    @Transactional(readOnly = true)
    public TicketDTO getById(Long id) {
        return TicketDTO.from(find(id));
    }

    /** GET /api/tickets/stats */
    @Transactional(readOnly = true)
    public TicketStatsDTO stats() {
        TicketStatsDTO s = new TicketStatsDTO();
        s.setTotal(ticketRepo.count());
        s.setOpen(ticketRepo.countByStatus(Ticket.TicketStatus.OPEN));
        s.setInProgress(ticketRepo.countByStatus(Ticket.TicketStatus.IN_PROGRESS));
        s.setResolved(ticketRepo.countByStatus(Ticket.TicketStatus.RESOLVED));
        s.setClosed(ticketRepo.countByStatus(Ticket.TicketStatus.CLOSED));
        s.setRejected(ticketRepo.countByStatus(Ticket.TicketStatus.REJECTED));
        s.setCritical(ticketRepo.countByPriority(Ticket.Priority.CRITICAL));
        s.setHigh(ticketRepo.countByPriority(Ticket.Priority.HIGH));
        s.setMedium(ticketRepo.countByPriority(Ticket.Priority.MEDIUM));
        s.setLow(ticketRepo.countByPriority(Ticket.Priority.LOW));
        return s;
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    /** PUT /api/tickets/{id} — edit details (only when OPEN) */
    public TicketDTO update(Long id, String title, String description,
                            String category, String priority) {
        Ticket t = find(id);
        if (t.getStatus() != Ticket.TicketStatus.OPEN)
            throw new IllegalStateException("Only OPEN tickets can be edited");
        t.setTitle(title);
        t.setDescription(description);
        t.setCategory(Ticket.Category.valueOf(category.toUpperCase()));
        t.setPriority(Ticket.Priority.valueOf(priority.toUpperCase()));
        return TicketDTO.from(ticketRepo.save(t));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    /** DELETE /api/tickets/{id} */
    public void delete(Long id) {
        Ticket t = find(id);
        t.getImageUrls().forEach(fileService::deleteFile);
        ticketRepo.delete(t);
    }

    // ── WORKFLOW ──────────────────────────────────────────────────────────────

    /** PUT /api/tickets/{id}/assign — assign to technician, auto → IN_PROGRESS */
    public TicketDTO assign(Long id, String technicianId) {
        if (!notBlank(technicianId)) throw new IllegalStateException("Technician ID is required");
        Ticket t = find(id);
        if (t.getStatus() == Ticket.TicketStatus.RESOLVED ||
            t.getStatus() == Ticket.TicketStatus.CLOSED   ||
            t.getStatus() == Ticket.TicketStatus.REJECTED)
            throw new IllegalStateException("Cannot assign a closed/resolved/rejected ticket");
        t.setAssignedTo(technicianId);
        t.setAssignedAt(LocalDateTime.now());
        if (t.getStatus() == Ticket.TicketStatus.OPEN)
            t.setStatus(Ticket.TicketStatus.IN_PROGRESS);
        return TicketDTO.from(ticketRepo.save(t));
    }

    /** PUT /api/tickets/{id}/status — update status with optional notes */
    public TicketDTO updateStatus(Long id, String newStatus, String notes) {
        Ticket t = find(id);
        Ticket.TicketStatus next = parseStatus(newStatus);
        validateTransition(t.getStatus(), next);
        t.setStatus(next);
        if (notBlank(notes)) t.setResolutionNotes(notes);
        if (next == Ticket.TicketStatus.RESOLVED || next == Ticket.TicketStatus.CLOSED)
            t.setResolvedAt(LocalDateTime.now());
        return TicketDTO.from(ticketRepo.save(t));
    }

    /** PUT /api/tickets/{id}/reject */
    public TicketDTO reject(Long id, String reason) {
        if (!notBlank(reason)) throw new IllegalStateException("Rejection reason is required");
        Ticket t = find(id);
        if (t.getStatus() == Ticket.TicketStatus.RESOLVED ||
            t.getStatus() == Ticket.TicketStatus.CLOSED)
            throw new IllegalStateException("Cannot reject a resolved/closed ticket");
        t.setStatus(Ticket.TicketStatus.REJECTED);
        t.setRejectionReason(reason);
        return TicketDTO.from(ticketRepo.save(t));
    }

    /** PUT /api/tickets/{id}/close */
    public TicketDTO close(Long id) {
        Ticket t = find(id);
        if (t.getStatus() != Ticket.TicketStatus.RESOLVED)
            throw new IllegalStateException("Only RESOLVED tickets can be closed");
        t.setStatus(Ticket.TicketStatus.CLOSED);
        return TicketDTO.from(ticketRepo.save(t));
    }

    // ── COMMENTS ──────────────────────────────────────────────────────────────

    /** POST /api/tickets/{id}/comments */
    public TicketDTO addComment(Long ticketId, String text, String author, String role) {
        if (!notBlank(text)) throw new IllegalStateException("Comment text is required");
        Ticket t = find(ticketId);
        TicketComment c = new TicketComment();
        c.setTicket(t);
        c.setText(text.trim());
        c.setAuthor(notBlank(author) ? author : "Anonymous");
        c.setAuthorRole(notBlank(role) ? role.toUpperCase() : "USER");
        commentRepo.save(c);
        return TicketDTO.from(ticketRepo.findById(ticketId).orElseThrow());
    }

    /** PUT /api/tickets/{id}/comments/{cid} */
    public TicketDTO editComment(Long ticketId, Long commentId, String text, String requestingUser) {
        find(ticketId);
        TicketComment c = findComment(commentId);
        if (!c.getAuthor().equals(requestingUser))
            throw new IllegalStateException("You can only edit your own comments");
        c.setText(text.trim());
        commentRepo.save(c);
        return TicketDTO.from(ticketRepo.findById(ticketId).orElseThrow());
    }

    /** DELETE /api/tickets/{id}/comments/{cid} */
    public TicketDTO deleteComment(Long ticketId, Long commentId, String requestingUser) {
        find(ticketId);
        TicketComment c = findComment(commentId);
        if (!c.getAuthor().equals(requestingUser) && !"ADMIN".equals(c.getAuthorRole()))
            throw new IllegalStateException("You can only delete your own comments");
        commentRepo.delete(c);
        return TicketDTO.from(ticketRepo.findById(ticketId).orElseThrow());
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private Ticket find(Long id) {
        return ticketRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket", id));
    }

    private TicketComment findComment(Long id) {
        return commentRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", id));
    }

    private void validateTransition(Ticket.TicketStatus from, Ticket.TicketStatus to) {
        boolean ok = switch (from) {
            case OPEN        -> to == Ticket.TicketStatus.IN_PROGRESS || to == Ticket.TicketStatus.RESOLVED;
            case IN_PROGRESS -> to == Ticket.TicketStatus.RESOLVED;
            case RESOLVED    -> to == Ticket.TicketStatus.CLOSED;
            default          -> false;
        };
        if (!ok) throw new IllegalStateException("Invalid transition: " + from + " → " + to);
    }

    private Ticket.TicketStatus parseStatus(String s) {
        try { return Ticket.TicketStatus.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Unknown status: " + s); }
    }

    private Ticket.Category parseCategory(String s) {
        try { return Ticket.Category.valueOf(s.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }

    private boolean notBlank(String s) { return s != null && !s.isBlank(); }
}
