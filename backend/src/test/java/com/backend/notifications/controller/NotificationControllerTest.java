package com.backend.notifications.controller;

import com.backend.backend.BackendApplication;
import com.backend.notifications.repository.NotificationRepository;
import com.backend.roles.model.Role;
import com.backend.users.model.User;
import com.backend.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private String userId;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        User user = new User("Test User", "test@example.com", "secret", Role.USER);
        userId = userRepository.save(user).getId();
    }

    @Test
    void createNotificationSupportsBrowserFriendlyGetRequest() throws Exception {
        mockMvc.perform(get("/api/notifications/create")
                        .param("userId", String.valueOf(userId))
                        .param("message", "Hello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isString())
                .andExpect(jsonPath("$.message").value("Hello"))
                .andExpect(jsonPath("$.read").value(false))
                .andExpect(jsonPath("$.user").doesNotExist())
                .andExpect(jsonPath("$.createdAt").doesNotExist());
    }

    @Test
    void getNotificationsReturnsTrimmedNotificationPayload() throws Exception {
        mockMvc.perform(get("/api/notifications/create")
                        .param("userId", String.valueOf(userId))
                        .param("message", "Hello"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").isString())
                .andExpect(jsonPath("$[0].message").value("Hello"))
                .andExpect(jsonPath("$[0].read").value(false))
                .andExpect(jsonPath("$[0].user").doesNotExist())
                .andExpect(jsonPath("$[0].createdAt").doesNotExist());
    }

    @Test
    void createNotificationReturnsNotFoundForUnknownUser() throws Exception {
        mockMvc.perform(get("/api/notifications/create")
                        .param("userId", "99999")
                        .param("message", "Hello"))
                .andExpect(status().isNotFound());
    }
}
