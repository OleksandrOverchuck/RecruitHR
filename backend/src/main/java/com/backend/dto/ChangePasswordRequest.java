package com.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Stare hasło jest wymagane")
    private String oldPassword;

    @NotBlank(message = "Nowe hasło jest wymagane")
    private String newPassword;
}