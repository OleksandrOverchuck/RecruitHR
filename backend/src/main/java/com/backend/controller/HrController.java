package com.backend.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.backend.dto.CreateJobOfferRequest;
import com.backend.dto.JobApplicationResponse;
import com.backend.dto.JobOfferResponse;
import com.backend.dto.UpdateApplicationStatusRequest;
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
            @Valid @RequestBody CreateJobOfferRequest request,
            Authentication authentication
    ) {
        String hrEmail = authentication.getName();
        return ResponseEntity.ok(hrService.createJobOffer(request, hrEmail));
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<String> updateJobOffer(
            @PathVariable Long id,
            @Valid @RequestBody CreateJobOfferRequest request,
            Authentication authentication
    ) {
        String hrEmail = authentication.getName();
        try {
            hrService.updateJobOffer(id, request, hrEmail);
            return ResponseEntity.ok("Oferta została zaktualizowana");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<String> deleteJobOffer(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String hrEmail = authentication.getName();
        try {
            hrService.deleteJobOffer(id, hrEmail);
            return ResponseEntity.ok("Oferta została usunięta");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/jobs/{id}/deactivate")
    public ResponseEntity<String> deactivateJobOffer(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String hrEmail = authentication.getName();
        try {
            hrService.deactivateJobOffer(id, hrEmail);
            return ResponseEntity.ok("Oferta została dezaktywowana");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/jobs/{id}/activate")
    public ResponseEntity<String> activateJobOffer(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String hrEmail = authentication.getName();
        try {
            hrService.activateJobOffer(id, hrEmail);
            return ResponseEntity.ok("Oferta została przywrócona");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
            @PathVariable Long id
    ) {
        try {
            hrService.acceptCandidate(id);
            return ResponseEntity.ok("Kandydat został zaakceptowany");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<String> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        try {
            hrService.updateApplicationStatus(id, request.getStatus());
            return ResponseEntity.ok("Status aplikacji został zaktualizowany");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/applications/{id}/contract", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> sendContract(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            hrService.sendContract(id, file);
            return ResponseEntity.ok("Umowa została przesłana do użytkownika");
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