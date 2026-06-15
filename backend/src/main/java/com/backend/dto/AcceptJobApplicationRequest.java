package com.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcceptJobApplicationRequest {

    @NotBlank(message = "Stanowisko jest wymagane")
    private String position;

    @NotNull(message = "Zarobki są wymagane")
    private Double salary;
}
