package com.backend.Initialize;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initAdmin() {
        return args -> {
            String adminEmail = "admin@hrplatform.com";

            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = User.builder()
                        .indexNumber("ADMIN0001")
                        .firstName("System")
                        .lastName("Admin")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("123"))
                        .role(Role.ADMIN)
                        .build();

                userRepository.save(admin);
                System.out.println(">>> Utworzono konto administratora: " + adminEmail + " / 123");
            } else {
                System.out.println(">>> Konto administratora już istnieje");
            }
        };
    }
}