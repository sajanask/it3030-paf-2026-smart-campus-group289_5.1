package com.backend.backend.model;

public enum TicketCategory {
    HARDWARE("Hardware Issues"),
    PLUMBING("Plumbing Issues"),
    ELECTRICAL("Electrical Issues"),
    CLEANING("Cleaning & Maintenance"),
    SECURITY("Security Issues"),
    INTERNET("Internet/Network Issues"),
    FURNITURE("Furniture & Fixtures"),
    OTHER("Other");

    private final String displayName;

    TicketCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
