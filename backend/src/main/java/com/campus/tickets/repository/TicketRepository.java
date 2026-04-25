package com.campus.tickets.repository;

import com.campus.tickets.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByStatusOrderByCreatedAtDesc(Ticket.TicketStatus status);
    List<Ticket> findByCategoryOrderByCreatedAtDesc(Ticket.Category category);
    List<Ticket> findByPriorityOrderByCreatedAtDesc(Ticket.Priority priority);
    List<Ticket> findByReportedByOrderByCreatedAtDesc(String reportedBy);
    List<Ticket> findByAssignedToOrderByCreatedAtDesc(String assignedTo);
    List<Ticket> findAllByOrderByCreatedAtDesc();

    @Query("SELECT t FROM Ticket t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Ticket> search(@Param("q") String q);

    long countByStatus(Ticket.TicketStatus status);
    long countByPriority(Ticket.Priority priority);
}
