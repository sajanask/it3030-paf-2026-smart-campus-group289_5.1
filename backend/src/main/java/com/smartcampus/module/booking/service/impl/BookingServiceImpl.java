package com.smartcampus.module.booking.service.impl;

import com.smartcampus.module.booking.model.Booking;
import com.smartcampus.module.booking.repository.BookingRepository;
import com.smartcampus.module.booking.service.BookingService;
import com.smartcampus.module.booking.dto.AvailabilityRequest;
import com.smartcampus.module.booking.dto.AvailabilityResponse;
import com.smartcampus.enums.BookingStatus;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class BookingServiceImpl implements BookingService {
    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Override
    public Booking createBooking(Booking booking) {
        log.info("Create booking request: resourceId={}, date={}, start={}, end={}, studentId={}, department={}",
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStudentId(),
                booking.getDepartment());

        List<Booking> existing = bookingRepository
                .findByResourceIdAndDate(booking.getResourceId(), booking.getDate());

        // 🔥 Conflict Checking Logic
        for (Booking b : existing) {
            if (booking.getStartTime().isBefore(b.getEndTime()) &&
                booking.getEndTime().isAfter(b.getStartTime())) {
                throw new RuntimeException("Time slot already booked!");
            }
        }

        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking saved successfully with id={} and status={}", saved.getId(), saved.getStatus());
        return saved;
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rejectBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.REJECTED);
        return bookingRepository.save(booking);
    }

    @Override
    public AvailabilityResponse checkAvailability(AvailabilityRequest request) {
        List<Booking> existingBookings = bookingRepository
                .findByResourceIdAndDate(request.getResourceId(), request.getDate());

        // Check for time conflicts
        for (Booking b : existingBookings) {
            if (b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING) {
                if (request.getStartTime().isBefore(b.getEndTime()) &&
                    request.getEndTime().isAfter(b.getStartTime())) {
                    return new AvailabilityResponse(false, "Time slot is already booked", b);
                }
            }
        }

        return new AvailabilityResponse(true, "Time slot is available");
    }
}
