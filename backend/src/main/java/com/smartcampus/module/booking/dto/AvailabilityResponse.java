package com.smartcampus.module.booking.dto;

import com.smartcampus.module.booking.model.Booking;

public class AvailabilityResponse {
    private boolean available;
    private String message;
    private Booking conflictingBooking;

    // Constructors
    public AvailabilityResponse() {}

    public AvailabilityResponse(boolean available, String message) {
        this.available = available;
        this.message = message;
        this.conflictingBooking = null;
    }

    public AvailabilityResponse(boolean available, String message, Booking conflictingBooking) {
        this.available = available;
        this.message = message;
        this.conflictingBooking = conflictingBooking;
    }

    // Getters and Setters
    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Booking getConflictingBooking() {
        return conflictingBooking;
    }

    public void setConflictingBooking(Booking conflictingBooking) {
        this.conflictingBooking = conflictingBooking;
    }
}
