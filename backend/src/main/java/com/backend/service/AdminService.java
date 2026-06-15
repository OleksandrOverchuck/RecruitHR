package com.backend.service;

import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.backend.dto.AdminUserResponse;
import com.backend.dto.ChangePasswordRequest;
import com.backend.dto.UpdateUserRoleRequest;
import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserResponse> getUsers(String query) {
        List<User> users;

        if (query == null || query.isBlank()) {
            users = userRepository.findAll();
        } else {
            users = userRepository
                    .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrIndexNumberContainingIgnoreCase(
                            query, query, query, query
                    );
        }

        return users.stream()
                .map(user -> AdminUserResponse.builder()
                        .id(user.getId())
                        .indexNumber(user.getIndexNumber())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .profileImageName(user.getProfileImageName())
                        .build())
                .toList();
    }

    public void updateUserRole(Long userId, String adminEmail, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie istnieje"));

        if (user.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new RuntimeException("Administrator nie może zmienić swojej własnej roli");
        }

        Role newRole;
        try {
            newRole = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Nieprawidłowa rola");
        }

        user.setRole(newRole);
        userRepository.save(user);
    }

    public void changeAdminPassword(String adminEmail, ChangePasswordRequest request) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Administrator nie istnieje"));

        if (!passwordEncoder.matches(request.getOldPassword(), admin.getPassword())) {
            throw new BadCredentialsException("Nieprawidłowe stare hasło");
        }

        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(admin);
    }
}