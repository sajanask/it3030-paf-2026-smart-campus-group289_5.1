package com.backend.notifications.controller;

import com.backend.notifications.model.Notification;
import com.backend.notifications.service.NotificationService;
import com.backend.users.model.User;
import com.backend.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    @Autowired
    private NotificationService service;

    @Autowired
    private UserRepository userRepo;

    @RequestMapping(value = "/create", method = {RequestMethod.GET, RequestMethod.POST})
    public NotificationResponse createNotification(
            @RequestParam String userId,
            @RequestParam String message) {
        return toResponse(service.createNotification(getUser(userId).getId(), message));
    }

    // Get notifications for user
    @GetMapping("/{userId}")
    public List<NotificationResponse> getNotifications(@PathVariable String userId) {
        return service.getUserNotifications(getUser(userId).getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Mark as read
    @PutMapping("/read/{id}")
    public String markAsRead(@PathVariable String id) {
        service.markAsRead(id);
        return "Marked as read";
    }

    private User getUser(String userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found: " + userId));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.isRead());
    }

    private record NotificationResponse(String id, String message, boolean read) {}
}
