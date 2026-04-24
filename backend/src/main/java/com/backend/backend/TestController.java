package com.backend.backend;

import com.backend.notifications.service.NotificationService;
import com.backend.users.model.User;
import com.backend.users.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class TestController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/hello")
    public String hello() {
        return "Working!";
    }

    @GetMapping("/admin")
    public String adminOnly(HttpServletRequest request) {
        String role = (String) request.getAttribute("role");

        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied");
        }

        return "Welcome Admin!";
    }

    @PostMapping("/book")
    public String createBooking(HttpServletRequest request) {
        String email = (String) request.getAttribute("email");
        boolean conflictDetected = Boolean.parseBoolean(request.getParameter("conflictDetected"));

        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authenticated user");
        }

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (conflictDetected) {
            notificationService.createNotification(
                    user.getId(),
                    "Booking conflict detected. Try another time");
            return "Booking conflict detected!";
        }

        User admin = userRepo.findByEmail("admin@test.com")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        notificationService.createNotification(
                admin.getId(),
                "New booking request from " + user.getName());

        return "Booking created!";
    }

    @PostMapping("/approve/{userId}")
    public String approveBooking(@PathVariable String userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        notificationService.createNotification(
                user.getId(),
                "Your booking has been approved");

        return "Approved";
    }
}
