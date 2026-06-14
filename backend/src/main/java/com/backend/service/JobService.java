package com.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.dto.JobOfferResponse;
import com.backend.entity.ApplicationStatus;
import com.backend.entity.JobApplication;
import com.backend.entity.JobOffer;
import com.backend.entity.User;
import com.backend.repository.JobApplicationRepository;
import com.backend.repository.JobOfferRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobOfferRepository jobOfferRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    public List<JobOfferResponse> getAllActiveJobs() {
        return jobOfferRepository.findAll()
                .stream()
                .filter(JobOffer::isActive)
                .map(job -> JobOfferResponse.builder()
                        .id(job.getId())
                        .title(job.getTitle())
                        .location(job.getLocation())
                        .level(job.getLevel())
                        .description(job.getDescription())
                        .active(job.isActive())
                        .build())
                .toList();
    }

    public void applyForJob(Long jobOfferId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie istnieje"));

        if (user.getCvFileName() == null || user.getCvFileName().isBlank()) {
            throw new RuntimeException("Musisz dodać CV przed aplikowaniem na ofertę");
        }

        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Oferta nie istnieje"));

        if (!jobOffer.isActive()) {
            throw new RuntimeException("Nie można aplikować na nieaktywną ofertę");
        }

        JobApplication application = JobApplication.builder()
                .user(user)
                .jobOffer(jobOffer)
                .status(ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();

        jobApplicationRepository.save(application);
    }
}