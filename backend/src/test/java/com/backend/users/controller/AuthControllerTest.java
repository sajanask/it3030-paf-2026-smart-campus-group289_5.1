package com.backend.users.controller;

import com.backend.backend.BackendApplication;
import com.backend.notifications.repository.NotificationRepository;
import com.backend.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    void registerSupportsBrowserFriendlyGetRequest() throws Exception {
        mockMvc.perform(get("/api/auth/register")
                        .param("name", "Jane")
                        .param("email", "jane@example.com")
                        .param("password", "secret123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jane"))
                .andExpect(jsonPath("$.email").value("jane@example.com"));
    }

    @Test
    void registerSupportsJsonPostRequest() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "User1",
                                  "email": "user@test.com",
                                  "password": "123456",
                                  "role": "USER"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("User1"))
                .andExpect(jsonPath("$.email").value("user@test.com"))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void loginSupportsBrowserFriendlyGetRequest() throws Exception {
        mockMvc.perform(get("/api/auth/register")
                        .param("name", "Jane")
                        .param("email", "jane@example.com")
                        .param("password", "secret123"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/login")
                        .param("email", "jane@example.com")
                        .param("password", "secret123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    void loginSupportsJsonPostRequest() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "User1",
                                  "email": "user@test.com",
                                  "password": "123456",
                                  "role": "USER"
                                }
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "user@test.com",
                                  "password": "123456"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    void loginReturnsUnauthorizedForWrongPassword() throws Exception {
        mockMvc.perform(get("/api/auth/register")
                        .param("name", "Jane")
                        .param("email", "jane@example.com")
                        .param("password", "secret123"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/login")
                        .param("email", "jane@example.com")
                        .param("password", "wrong"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginReturnsJsonForMissingPasswordParameter() throws Exception {
        mockMvc.perform(get("/api/auth/login")
                        .param("email", "jane@example.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Missing required parameter: password"))
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }
}
