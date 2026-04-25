package com.smartcampus.module.booking.service.impl;

import com.smartcampus.module.booking.model.Booking;
import com.smartcampus.module.booking.repository.BookingRepository;
import com.smartcampus.module.booking.service.BookingService;
import com.smartcampus.module.booking.dto.AvailabilityRequest;
import com.smartcampus.module.booking.dto.AvailabilityResponse;
import com.smartcampus.module.booking.exception.BookingConflictException;
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

        validateNoApprovedConflict(booking.getResourceId(), booking.getDate(), booking.getStartTime(), booking.getEndTime(), booking.getId());

        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);
        log.info("Booking saved successfully with id={} and status={}", saved.getId(), saved.getStatus());
        return saved;
    }

    @Override
    public Booking updateBooking(String id, Booking booking) {
        Booking existingBooking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        validateNoApprovedConflict(
                booking.getResourceId(),
                booking.getDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                id);

        existingBooking.setResourceId(booking.getResourceId());
        existingBooking.setDate(booking.getDate());
        existingBooking.setStartTime(booking.getStartTime());
        existingBooking.setEndTime(booking.getEndTime());
        existingBooking.setPurpose(booking.getPurpose());
        existingBooking.setStudentId(booking.getStudentId());
        existingBooking.setDepartment(booking.getDepartment());

        if (booking.getStatus() != null) {
            existingBooking.setStatus(booking.getStatus());
        }

        return bookingRepository.save(existingBooking);
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

        for (Booking booking : existingBookings) {
            if (!isApprovedBlockingBooking(booking, request.getCurrentBookingId())) {
                continue;
            }

            if (request.getStartTime().isBefore(booking.getEndTime()) &&
                request.getEndTime().isAfter(booking.getStartTime())) {
                return new AvailabilityResponse(false, "Resource already has an approved booking for this time slot.", booking);
            }
        }

        return new AvailabilityResponse(true, "Time slot is available");
    }

    private void validateNoApprovedConflict(String resourceId, java.time.LocalDate date, java.time.LocalTime startTime,
            java.time.LocalTime endTime, String currentBookingId) {
        List<Booking> existingBookings = bookingRepository.findByResourceIdAndDate(resourceId, date);

        for (Booking booking : existingBookings) {
            if (!isApprovedBlockingBooking(booking, currentBookingId)) {
                continue;
            }

            if (startTime.isBefore(booking.getEndTime()) && endTime.isAfter(booking.getStartTime())) {
                throw new BookingConflictException("Resource already has an approved booking for this time slot.");
            }
        }
    }

    private boolean isApprovedBlockingBooking(Booking booking, String currentBookingId) {
        if (booking.getStatus() != BookingStatus.APPROVED) {
            return false;
        }

        return currentBookingId == null || !currentBookingId.equals(booking.getId());
    }
}
