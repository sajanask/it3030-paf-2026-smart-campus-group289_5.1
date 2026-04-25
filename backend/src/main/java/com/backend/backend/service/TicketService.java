package com.backend.backend.service;

import com.backend.backend.dto.TicketDTO;
import com.backend.backend.model.Ticket;
import com.backend.backend.model.TicketStatus;
import com.backend.backend.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    // Create a new ticket
    public TicketDTO createTicket(Ticket ticket) {
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setStatus(TicketStatus.OPEN);
        Ticket savedTicket = ticketRepository.save(ticket);
        return convertToDTO(savedTicket);
    }

    // Get all tickets
    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get ticket by ID
    public TicketDTO getTicketById(Long id) {
        return ticketRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));
    }

    // Get open tickets (for technician dashboard)
    public List<TicketDTO> getOpenTickets() {
        return ticketRepository.findByStatusOrderByPriorityDescCreatedAtAsc(TicketStatus.OPEN)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get tickets assigned to technician
    public List<TicketDTO> getTicketsByAssignee(String assignedTo) {
        return ticketRepository.findByAssignedTo(assignedTo)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Update ticket status
    public TicketDTO updateTicketStatus(Long id, String newStatus, String notes) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));

        try {
            TicketStatus status = TicketStatus.valueOf(newStatus);
            ticket.setStatus(status);
            ticket.setUpdatedAt(LocalDateTime.now());

            if (status == TicketStatus.RESOLVED || status == TicketStatus.REJECTED) {
                ticket.setResolvedAt(LocalDateTime.now());
                if (notes != null) {
                    ticket.setResolutionNotes(notes);
                }
            }

            Ticket updatedTicket = ticketRepository.save(ticket);
            return convertToDTO(updatedTicket);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + newStatus);
        }
    }

    // Assign ticket to technician
    public TicketDTO assignTicket(Long id, String technicianId) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));

        ticket.setAssignedTo(technicianId);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updatedTicket = ticketRepository.save(ticket);
        return convertToDTO(updatedTicket);
    }

    // Reject ticket with reason
    public TicketDTO rejectTicket(Long id, String reason) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));

        ticket.setStatus(TicketStatus.REJECTED);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.setRejectionReason(reason);
        ticket.setUpdatedAt(LocalDateTime.now());
        Ticket updatedTicket = ticketRepository.save(ticket);
        return convertToDTO(updatedTicket);
    }

    // Delete ticket (only resolved or rejected)
    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found with ID: " + id));

        if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.REJECTED) {
            ticket.setStatus(TicketStatus.CLOSED);
            ticketRepository.save(ticket);
        } else {
            throw new RuntimeException("Cannot delete an open or in-progress ticket");
        }
    }

    // Convert entity to DTO
    private TicketDTO convertToDTO(Ticket ticket) {
        return TicketDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory().getDisplayName())
                .priority(ticket.getPriority().getDisplayName())
                .status(ticket.getStatus().getDisplayName())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .reportedBy(ticket.getReportedBy())
                .assignedTo(ticket.getAssignedTo())
                .imageUrls(ticket.getImageUrls())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .build();
    }
}
