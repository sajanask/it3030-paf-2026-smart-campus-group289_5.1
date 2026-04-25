package com.backend.notifications.service;

import com.backend.notifications.model.Notification;
import com.backend.notifications.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository repo;

    public Notification createNotification(String userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        return repo.save(n);
    }

    public List<Notification> getUserNotifications(String userId) {
        return repo.findByUserId(userId);
    }

    public void markAsRead(String id) {
        Notification n = repo.findById(id).orElseThrow();
        n.setRead(true);
        repo.save(n);
    }
}
