package com.backend.backend;

import com.backend.roles.model.Role;
import com.backend.users.model.User;
import com.backend.users.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedDefaultUser(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(new User(
                        "Demo User",
                        "demo@smartcampus.local",
                        "demo123",
                        Role.USER));
            }
        };
    }
}
