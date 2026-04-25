package com.backend.backend.model;

public enum TicketStatus {
    OPEN("Open - Awaiting Technician"),
    IN_PROGRESS("In Progress - Being Fixed"),
    RESOLVED("Resolved - Issue Fixed"),
    REJECTED("Rejected - Cannot Fix"),
    CLOSED("Closed - Archived");

    private final String displayName;

    TicketStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
