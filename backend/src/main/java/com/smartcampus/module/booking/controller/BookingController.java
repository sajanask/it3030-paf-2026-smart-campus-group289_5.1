package com.smartcampus.module.booking.controller;

import com.smartcampus.module.booking.model.Booking;
import com.smartcampus.module.booking.service.BookingService;
import com.smartcampus.module.booking.dto.AvailabilityRequest;
import com.smartcampus.module.booking.dto.AvailabilityResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // Create booking
    @PostMapping
    public Booking create(@RequestBody Booking booking) {
        return bookingService.createBooking(booking);
    }

    // Get all bookings
    @GetMapping
    public List<Booking> getAll() {
        return bookingService.getAllBookings();
    }

    // Approve booking
    @PutMapping("/{id}/approve")
    public Booking approve(@PathVariable String id) {
        return bookingService.approveBooking(id);
    }

    // Reject booking
    @PutMapping("/{id}/reject")
    public Booking reject(@PathVariable String id) {
        return bookingService.rejectBooking(id);
    }

    // Check availability
    @PostMapping("/check-availability")
    public AvailabilityResponse checkAvailability(@RequestBody AvailabilityRequest request) {
        return bookingService.checkAvailability(request);
    }
}
