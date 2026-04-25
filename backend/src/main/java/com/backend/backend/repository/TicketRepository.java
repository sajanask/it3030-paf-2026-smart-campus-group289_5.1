package com.backend.backend.repository;

import com.backend.backend.model.Ticket;
import com.backend.backend.model.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByReportedBy(String reportedBy);
    List<Ticket> findByAssignedTo(String assignedTo);
    List<Ticket> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findByStatusOrderByPriorityDescCreatedAtAsc(TicketStatus status);
}
