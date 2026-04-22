package com.campus.tickets;

import com.campus.tickets.dto.TicketDTO;
import com.campus.tickets.exception.ResourceNotFoundException;
import com.campus.tickets.model.Ticket;
import com.campus.tickets.repository.TicketCommentRepository;
import com.campus.tickets.repository.TicketRepository;
import com.campus.tickets.service.FileStorageService;
import com.campus.tickets.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock TicketRepository ticketRepo;
    @Mock TicketCommentRepository commentRepo;
    @Mock FileStorageService fileService;

    @InjectMocks TicketService service;

    private Ticket openTicket;

    @BeforeEach
    void setup() {
        openTicket = new Ticket();
        openTicket.setId(1L);
        openTicket.setTitle("Test issue");
        openTicket.setDescription("Something is broken here");
        openTicket.setCategory(Ticket.Category.HARDWARE);
        openTicket.setPriority(Ticket.Priority.HIGH);
        openTicket.setReportedBy("student01");
        openTicket.setStatus(Ticket.TicketStatus.OPEN);
        openTicket.setCreatedAt(LocalDateTime.now());
        openTicket.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void create_savesTicketAndReturnsDTO() {
        when(fileService.storeFiles(any())).thenReturn(Collections.emptyList());
        when(ticketRepo.save(any())).thenReturn(openTicket);

        TicketDTO result = service.create("Test issue", "Something is broken here",
                "HARDWARE", "HIGH", "student01", null);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Test issue");
        assertThat(result.getStatus()).isEqualTo("OPEN");
        verify(ticketRepo, times(1)).save(any(Ticket.class));
    }

    @Test
    void getById_existingId_returnsDTO() {
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        TicketDTO dto = service.getById(1L);
        assertThat(dto.getId()).isEqualTo(1L);
    }

    @Test
    void getById_nonExistingId_throwsNotFound() {
        when(ticketRepo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void assign_openTicket_setsInProgressAndAssignee() {
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        when(ticketRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketDTO dto = service.assign(1L, "tech-001");

        assertThat(dto.getAssignedTo()).isEqualTo("tech-001");
        assertThat(dto.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    void assign_resolvedTicket_throwsIllegalState() {
        openTicket.setStatus(Ticket.TicketStatus.RESOLVED);
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        assertThatThrownBy(() -> service.assign(1L, "tech-001"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void updateStatus_openToInProgress_succeeds() {
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        when(ticketRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketDTO dto = service.updateStatus(1L, "IN_PROGRESS", null);
        assertThat(dto.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    void updateStatus_invalidTransition_throwsIllegalState() {
        openTicket.setStatus(Ticket.TicketStatus.RESOLVED);
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        assertThatThrownBy(() -> service.updateStatus(1L, "OPEN", null))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void reject_withReason_setsRejectedStatus() {
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        when(ticketRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketDTO dto = service.reject(1L, "Duplicate ticket");
        assertThat(dto.getStatus()).isEqualTo("REJECTED");
        assertThat(dto.getRejectionReason()).isEqualTo("Duplicate ticket");
    }

    @Test
    void reject_withoutReason_throwsIllegalState() {
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        assertThatThrownBy(() -> service.reject(1L, ""))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void getAll_noFilters_returnsAll() {
        when(ticketRepo.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(openTicket));
        List<TicketDTO> result = service.getAll(null, null, null, null);
        assertThat(result).hasSize(1);
    }

    @Test
    void delete_existingTicket_callsRepositoryDelete() {
        when(ticketRepo.findById(1L)).thenReturn(Optional.of(openTicket));
        service.delete(1L);
        verify(ticketRepo).delete(openTicket);
    }
}
