package com.smartcampus.module.booking.controller;

import com.smartcampus.module.booking.dto.AvailabilityRequest;
import com.smartcampus.module.booking.dto.AvailabilityResponse;
import com.smartcampus.module.booking.model.Booking;
import com.smartcampus.module.booking.service.BookingService;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Create booking
    @PostMapping
    public ResponseEntity<Booking> create(@RequestBody Booking booking) {
        Booking createdBooking = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBooking);
    }

    // Get all bookings
    @GetMapping
    public ResponseEntity<List<Booking>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Approve booking
    @PutMapping("/{id}/approve")
    public ResponseEntity<Booking> approve(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    // Reject booking
    @PutMapping("/{id}/reject")
    public ResponseEntity<Booking> reject(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.rejectBooking(id));
    }

    // Check availability
    @PostMapping("/check-availability")
    public ResponseEntity<AvailabilityResponse> checkAvailability(@RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(bookingService.checkAvailability(request));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException exception) {
        String message = exception.getMessage() == null ? "Booking operation failed" : exception.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (message.toLowerCase().contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (message.toLowerCase().contains("already booked")) {
            status = HttpStatus.CONFLICT;
        }

        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
