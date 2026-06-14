package com.backend.controller;

import com.backend.dto.JobOfferResponse;
import com.backend.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<List<JobOfferResponse>> getAllActiveJobs() {
        return ResponseEntity.ok(jobService.getAllActiveJobs());
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<String> applyForJob(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        jobService.applyForJob(id, userEmail);
        return ResponseEntity.ok("Aplikacja została wysłana");
    }
}