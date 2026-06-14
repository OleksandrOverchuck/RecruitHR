package com.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateJobOfferRequest {

    @NotBlank(message = "Tytuł jest wymagany")
    private String title;

    private String location;
    private String level;
    private String description;
}