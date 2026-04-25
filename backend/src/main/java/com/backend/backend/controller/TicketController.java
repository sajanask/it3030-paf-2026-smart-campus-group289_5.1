package com.backend.backend.controller;

import com.backend.backend.dto.TicketDTO;
import com.backend.backend.model.Ticket;
import com.backend.backend.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "*")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    private static final String UPLOAD_DIR = "uploads/tickets/";

    /**
     * POST /api/tickets - Create a new ticket
     * Accepts multipart form data with title, description, category, priority, reportedBy, and up to 3 images
     */
    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String category,
            @RequestParam String priority,
            @RequestParam String reportedBy,
            @RequestParam(required = false) MultipartFile[] images) {
        try {
            List<String> imageUrls = new ArrayList<>();

            // Handle image uploads (max 3)
            if (images != null && images.length > 0) {
                int imageCount = Math.min(images.length, 3);
                for (int i = 0; i < imageCount; i++) {
                    String imageUrl = saveImage(images[i]);
                    imageUrls.add(imageUrl);
                }
            }

            // Create ticket entity
            Ticket ticket = Ticket.builder()
                    .title(title)
                    .description(description)
                    .category(Enum.valueOf(com.backend.backend.model.TicketCategory.class, category))
                    .priority(Enum.valueOf(com.backend.backend.model.TicketPriority.class, priority))
                    .reportedBy(reportedBy)
                    .imageUrls(imageUrls)
                    .build();

            TicketDTO createdTicket = ticketService.createTicket(ticket);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /api/tickets - Get all tickets
     */
    @GetMapping
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        List<TicketDTO> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * GET /api/tickets/open - Get all open tickets (for technician dashboard)
     */
    @GetMapping("/open")
    public ResponseEntity<List<TicketDTO>> getOpenTickets() {
        List<TicketDTO> tickets = ticketService.getOpenTickets();
        return ResponseEntity.ok(tickets);
    }

    /**
     * GET /api/tickets/{id} - Get ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> getTicketById(@PathVariable Long id) {
        try {
            TicketDTO ticket = ticketService.getTicketById(id);
            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * GET /api/tickets/assignee/{technicianId} - Get tickets assigned to a technician
     */
    @GetMapping("/assignee/{technicianId}")
    public ResponseEntity<List<TicketDTO>> getTicketsByAssignee(@PathVariable String technicianId) {
        List<TicketDTO> tickets = ticketService.getTicketsByAssignee(technicianId);
        return ResponseEntity.ok(tickets);
    }

    /**
     * PUT /api/tickets/{id}/status - Update ticket status
     * Payload: { "status": "IN_PROGRESS|RESOLVED|REJECTED", "notes": "optional notes" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<TicketDTO> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        try {
            TicketDTO updatedTicket = ticketService.updateTicketStatus(id, status, notes);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * PUT /api/tickets/{id}/assign - Assign ticket to technician
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketDTO> assignTicket(
            @PathVariable Long id,
            @RequestParam String technicianId) {
        try {
            TicketDTO updatedTicket = ticketService.assignTicket(id, technicianId);
            return ResponseEntity.ok(updatedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * PUT /api/tickets/{id}/reject - Reject ticket with reason
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<TicketDTO> rejectTicket(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            TicketDTO rejectedTicket = ticketService.rejectTicket(id, reason);
            return ResponseEntity.ok(rejectedTicket);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * DELETE /api/tickets/{id} - Delete/Close ticket (only resolved or rejected)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        try {
            ticketService.deleteTicket(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Helper method to save image files
     */
    private String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(uniqueFilename);
        Files.write(filePath, file.getBytes());

        // Return relative URL path
        return "/uploads/tickets/" + uniqueFilename;
    }
}
