package com.backend.controller;

import com.backend.dto.AdminUserResponse;
import com.backend.dto.ChangePasswordRequest;
import com.backend.dto.UpdateUserRoleRequest;
import com.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<AdminUserResponse> getUsers(
            @RequestParam(required = false) String query
    ) {
        return adminService.getUsers(query);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<String> updateUserRole(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        String adminEmail = authentication.getName();
        adminService.updateUserRole(id, adminEmail, request);
        return ResponseEntity.ok("Rola użytkownika została zmieniona");
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        String email = authentication.getName();
        adminService.changeAdminPassword(email, request);
        return ResponseEntity.ok("Hasło zostało zmienione");
    }
}