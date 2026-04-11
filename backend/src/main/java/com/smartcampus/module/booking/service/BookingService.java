package com.smartcampus.module.booking.service;

import com.smartcampus.module.booking.model.Booking;
import com.smartcampus.module.booking.dto.AvailabilityRequest;
import com.smartcampus.module.booking.dto.AvailabilityResponse;

import java.util.List;

public interface BookingService {

    Booking createBooking(Booking booking);

    List<Booking> getAllBookings();

    Booking approveBooking(String id);

    Booking rejectBooking(String id);

    AvailabilityResponse checkAvailability(AvailabilityRequest request);
}
