package com.backend.dto;

import com.backend.entity.ApplicationStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApplicationStatusRequest {

    @NotNull(message = "Status jest wymagany")
    private ApplicationStatus status;
}
