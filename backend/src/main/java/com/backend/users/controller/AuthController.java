package com.backend.users.controller;

import com.backend.users.model.User;
import com.backend.users.repository.UserRepository;
import com.backend.security.jwt.JwtUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtUtils jwtUtils;

    // REGISTER
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return repo.save(user);
    }

    @GetMapping("/register")
    public User registerWithParams(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam(defaultValue = "USER") String role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(parseRole(role));
        return repo.save(user);
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {
        return authenticate(user.getEmail(), user.getPassword());
    }

    @GetMapping("/login")
    public Map<String, String> loginWithParams(
            @RequestParam String email,
            @RequestParam String password) {
        return authenticate(email, password);
    }

    private Map<String, String> authenticate(String email, String password) {
        User existing = repo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        if (!existing.getPassword().equals(password)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid password");
        }

        String token = jwtUtils.generateToken(
                existing.getEmail(),
                existing.getRole().name());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return response;
    }

    private com.backend.roles.model.Role parseRole(String role) {
        try {
            return com.backend.roles.model.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid role: " + role);
        }
    }
}
