package com.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JobOfferResponse {
    private Long id;
    private String title;
    private String location;
    private String level;
    private String description;
    private boolean active;
}