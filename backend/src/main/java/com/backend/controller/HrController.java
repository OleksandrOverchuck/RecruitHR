package com.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.dto.AcceptJobApplicationRequest;
import com.backend.dto.CreateJobOfferRequest;
import com.backend.dto.JobApplicationResponse;
import com.backend.dto.JobOfferResponse;
import com.backend.service.HrService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HrController {

    private final HrService hrService;

    @PostMapping("/jobs")
    public ResponseEntity<JobOfferResponse> createJobOffer(
            @Valid @RequestBody CreateJobOfferRequest request
    ) {
        return ResponseEntity.ok(hrService.createJobOffer(request));
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<JobOfferResponse>> getAllJobOffers() {
        return ResponseEntity.ok(hrService.getAllJobOffers());
    }

    @GetMapping("/applications")
    public ResponseEntity<List<JobApplicationResponse>> getAllApplications() {
        return ResponseEntity.ok(hrService.getAllApplications());
    }

    @PostMapping("/applications/{id}/accept")
    public ResponseEntity<String> acceptCandidate(
            @PathVariable Long id,
            @Valid @RequestBody AcceptJobApplicationRequest request
    ) {
        try {
            hrService.acceptCandidate(id, request);
            return ResponseEntity.ok("Kandydat został zaakceptowany");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/jobs/{id}/apply")
    public ResponseEntity<String> applyForJob(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        hrService.applyForJob(id, userEmail);
        return ResponseEntity.ok("Aplikacja została wysłana");
    }
}