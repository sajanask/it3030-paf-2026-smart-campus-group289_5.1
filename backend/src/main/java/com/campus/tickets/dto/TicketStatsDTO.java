package com.campus.tickets.dto;

public class TicketStatsDTO {
    private long total, open, inProgress, resolved, closed, rejected;
    private long critical, high, medium, low;

    public long getTotal() { return total; }
    public void setTotal(long v) { total = v; }
    public long getOpen() { return open; }
    public void setOpen(long v) { open = v; }
    public long getInProgress() { return inProgress; }
    public void setInProgress(long v) { inProgress = v; }
    public long getResolved() { return resolved; }
    public void setResolved(long v) { resolved = v; }
    public long getClosed() { return closed; }
    public void setClosed(long v) { closed = v; }
    public long getRejected() { return rejected; }
    public void setRejected(long v) { rejected = v; }
    public long getCritical() { return critical; }
    public void setCritical(long v) { critical = v; }
    public long getHigh() { return high; }
    public void setHigh(long v) { high = v; }
    public long getMedium() { return medium; }
    public void setMedium(long v) { medium = v; }
    public long getLow() { return low; }
    public void setLow(long v) { low = v; }
}
