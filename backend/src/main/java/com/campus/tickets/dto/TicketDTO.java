package com.campus.tickets.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.campus.tickets.model.Ticket;

public class TicketDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String reportedBy;
    private String assignedTo;
    private String resolutionNotes;
    private String rejectionReason;
    private List<String> imageUrls;
    private List<CommentDTO> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime assignedAt;

    public static TicketDTO from(Ticket t) {
        TicketDTO dto = new TicketDTO();
        dto.id = t.getId();
        dto.title = t.getTitle();
        dto.description = t.getDescription();
        dto.category = t.getCategory().name();
        dto.priority = t.getPriority().name();
        dto.status = t.getStatus().name();
        dto.reportedBy = t.getReportedBy();
        dto.assignedTo = t.getAssignedTo();
        dto.resolutionNotes = t.getResolutionNotes();
        dto.rejectionReason = t.getRejectionReason();
        dto.imageUrls = t.getImageUrls();
        dto.createdAt = t.getCreatedAt();
        dto.updatedAt = t.getUpdatedAt();
        dto.resolvedAt = t.getResolvedAt();
        dto.assignedAt = t.getAssignedAt();
        if (t.getComments() != null) {
            dto.comments = t.getComments().stream().map(CommentDTO::from).collect(Collectors.toList());
        }
        return dto;
    }

    // --- Inner CommentDTO ---
    public static class CommentDTO {
        private Long id;
        private String text;
        private String author;
        private String authorRole;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static CommentDTO from(com.campus.tickets.model.TicketComment c) {
            CommentDTO dto = new CommentDTO();
            dto.id = c.getId();
            dto.text = c.getText();
            dto.author = c.getAuthor();
            dto.authorRole = c.getAuthorRole();
            dto.createdAt = c.getCreatedAt();
            dto.updatedAt = c.getUpdatedAt();
            return dto;
        }

        public Long getId() { return id; }
        public String getText() { return text; }
        public String getAuthor() { return author; }
        public String getAuthorRole() { return authorRole; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getPriority() { return priority; }
    public String getStatus() { return status; }
    public String getReportedBy() { return reportedBy; }
    public String getAssignedTo() { return assignedTo; }
    public String getResolutionNotes() { return resolutionNotes; }
    public String getRejectionReason() { return rejectionReason; }
    public List<String> getImageUrls() { return imageUrls; }
    public List<CommentDTO> getComments() { return comments; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
}
