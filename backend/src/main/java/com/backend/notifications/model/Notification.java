package com.backend.notifications.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String message;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String userId;

    // Getters & Setters
    public String getId() { return id; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
