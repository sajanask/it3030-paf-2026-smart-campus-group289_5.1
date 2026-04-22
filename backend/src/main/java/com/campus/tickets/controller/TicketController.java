package com.campus.tickets.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campus.tickets.dto.TicketDTO;
import com.campus.tickets.dto.TicketStatsDTO;
import com.campus.tickets.service.TicketService;

/**
 * Module C – Maintenance & Incident Ticketing
 *
 * GET    /api/tickets                        list (filter: status, category, search)
 * POST   /api/tickets                        create (multipart/form-data + images)
 * GET    /api/tickets/stats                  statistics
 * GET    /api/tickets/{id}                   single ticket
 * PUT    /api/tickets/{id}                   update details
 * DELETE /api/tickets/{id}                   delete
 * PUT    /api/tickets/{id}/assign            assign technician
 * PUT    /api/tickets/{id}/status            update status
 * PUT    /api/tickets/{id}/reject            reject with reason
 * PUT    /api/tickets/{id}/close             close resolved ticket
 * POST   /api/tickets/{id}/comments          add comment
 * PUT    /api/tickets/{id}/comments/{cid}    edit comment
 * DELETE /api/tickets/{id}/comments/{cid}    delete comment
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class TicketController {

    private final TicketService svc;

    public TicketController(TicketService svc) {
        this.svc = svc;
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<TicketDTO>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(svc.getAll(status, category, priority, search));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketDTO> create(
            @RequestParam("title")       String title,
            @RequestParam("description") String description,
            @RequestParam("category")    String category,
            @RequestParam("priority")    String priority,
            @RequestParam("reportedBy")  String reportedBy,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(svc.create(title, description, category, priority, reportedBy, images));
    }

    @GetMapping("/stats")
    public ResponseEntity<TicketStatsDTO> stats() {
        return ResponseEntity.ok(svc.stats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(svc.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketDTO> update(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(svc.update(id,
                body.get("title"), body.get("description"),
                body.get("category"), body.get("priority")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.ok(Map.of("message", "Ticket #" + id + " deleted successfully"));
    }

    // ── WORKFLOW ──────────────────────────────────────────────────────────────

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketDTO> assign(
            @PathVariable Long id,
            @RequestParam String technicianId) {
        return ResponseEntity.ok(svc.assign(id, technicianId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(svc.updateStatus(id, status, notes));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<TicketDTO> reject(
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(svc.reject(id, reason));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<TicketDTO> close(@PathVariable Long id) {
        return ResponseEntity.ok(svc.close(id));
    }

    // ── COMMENTS ──────────────────────────────────────────────────────────────

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketDTO> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                svc.addComment(id, body.get("text"),
                        body.getOrDefault("author", "Anonymous"),
                        body.getOrDefault("authorRole", "USER")));
    }

    @PutMapping("/{id}/comments/{cid}")
    public ResponseEntity<TicketDTO> editComment(
            @PathVariable Long id,
            @PathVariable Long cid,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                svc.editComment(id, cid, body.get("text"), body.get("requestingUser")));
    }

    @DeleteMapping("/{id}/comments/{cid}")
    public ResponseEntity<TicketDTO> deleteComment(
            @PathVariable Long id,
            @PathVariable Long cid,
            @RequestParam String requestingUser) {
        return ResponseEntity.ok(svc.deleteComment(id, cid, requestingUser));
    }
}
