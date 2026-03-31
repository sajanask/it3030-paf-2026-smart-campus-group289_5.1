package com.smartcampus.module.booking.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AvailabilityRequest {
    private String resourceId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    // Constructors
    public AvailabilityRequest() {}

    public AvailabilityRequest(String resourceId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        this.resourceId = resourceId;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }
}
