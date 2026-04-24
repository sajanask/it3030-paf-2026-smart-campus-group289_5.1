package com.backend.backend;

import com.backend.notifications.repository.NotificationRepository;
import com.backend.notifications.model.Notification;
import com.backend.roles.model.Role;
import com.backend.security.jwt.JwtUtils;
import com.backend.users.model.User;
import com.backend.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
class TestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void helloIsAccessibleForAuthenticatedUser() throws Exception {
        User user = userRepository.save(new User("User", "user@test.com", "secret", Role.USER));
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        mockMvc.perform(get("/hello")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Working!"));
    }

    @Test
    void adminEndpointRejectsRegularUser() throws Exception {
        User user = userRepository.save(new User("User", "user@test.com", "secret", Role.USER));
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        mockMvc.perform(get("/admin")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Access Denied"));
    }

    @Test
    void adminEndpointAllowsAdminUser() throws Exception {
        User admin = userRepository.save(new User("Admin", "admin@test.com", "secret", Role.ADMIN));
        String token = jwtUtils.generateToken(admin.getEmail(), admin.getRole().name());

        mockMvc.perform(get("/admin")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Welcome Admin!"));
    }

    @Test
    void bookCreatesNotificationForAdmin() throws Exception {
        User user = userRepository.save(new User("User", "user@test.com", "secret", Role.USER));
        User admin = userRepository.save(new User("Admin", "admin@test.com", "secret", Role.ADMIN));
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        mockMvc.perform(post("/book")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Booking created!"));

        List<Notification> notifications = notificationRepository.findByUserId(admin.getId());
        org.junit.jupiter.api.Assertions.assertEquals(1, notifications.size());
        org.junit.jupiter.api.Assertions.assertEquals(
                "New booking request from " + user.getName(),
                notifications.get(0).getMessage());
    }

    @Test
    void bookWithConflictCreatesNotificationForUser() throws Exception {
        User user = userRepository.save(new User("User", "user@test.com", "secret", Role.USER));
        userRepository.save(new User("Admin", "admin@test.com", "secret", Role.ADMIN));
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        mockMvc.perform(post("/book")
                        .param("conflictDetected", "true")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Booking conflict detected!"));

        List<Notification> notifications = notificationRepository.findByUserId(user.getId());
        org.junit.jupiter.api.Assertions.assertEquals(1, notifications.size());
        org.junit.jupiter.api.Assertions.assertEquals(
                "Booking conflict detected. Try another time",
                notifications.get(0).getMessage());
    }

    @Test
    void approveBookingCreatesNotificationForTargetUser() throws Exception {
        User admin = userRepository.save(new User("Admin", "admin@test.com", "secret", Role.ADMIN));
        User user = userRepository.save(new User("User", "user@test.com", "secret", Role.USER));
        String token = jwtUtils.generateToken(admin.getEmail(), admin.getRole().name());

        mockMvc.perform(post("/approve/{userId}", user.getId())
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string("Approved"));

        List<Notification> notifications = notificationRepository.findByUserId(user.getId());
        org.junit.jupiter.api.Assertions.assertEquals(1, notifications.size());
        org.junit.jupiter.api.Assertions.assertEquals(
                "Your booking has been approved",
                notifications.get(0).getMessage());
    }
}
