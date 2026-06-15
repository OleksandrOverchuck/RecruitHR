package com.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String indexNumber;
    private String role;
    private String cvFileName;
    private String profileImageName;
    private String position;
    private Double salary;
    private Boolean contractSigned;
}