package com.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobApplicationResponse {
    private Long id;
    private Long userId;
    private String indexNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String profileImageName;
    private String cvFileName;
    private Long jobOfferId;
    private String jobTitle;
    private String status;
    private Boolean contractSent;
    private Boolean contractSigned;
    private String appliedAt;
}