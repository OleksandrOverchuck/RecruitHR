package com.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserResponse {
    private Long id;
    private String indexNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String profileImageName;
}