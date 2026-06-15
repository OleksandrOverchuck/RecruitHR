package com.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.backend.dto.CreateJobOfferRequest;
import com.backend.dto.JobApplicationResponse;
import com.backend.dto.JobOfferResponse;
import com.backend.entity.ApplicationStatus;
import com.backend.entity.JobApplication;
import com.backend.entity.JobOffer;
import com.backend.entity.Role;
import com.backend.entity.User;
import com.backend.repository.JobApplicationRepository;
import com.backend.repository.JobOfferRepository;
import com.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HrService {

    private final JobOfferRepository jobOfferRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

    public JobOfferResponse createJobOffer(CreateJobOfferRequest request) {
        JobOffer jobOffer = JobOffer.builder()
                .title(request.getTitle())
                .location(request.getLocation())
                .level(request.getLevel())
                .description(request.getDescription())
                .active(true)
                .build();

        jobOfferRepository.save(jobOffer);

        return JobOfferResponse.builder()
                .id(jobOffer.getId())
                .title(jobOffer.getTitle())
                .location(jobOffer.getLocation())
                .level(jobOffer.getLevel())
                .description(jobOffer.getDescription())
                .active(jobOffer.isActive())
                .build();
    }

    public List<JobOfferResponse> getAllJobOffers() {
        return jobOfferRepository.findAll()
                .stream()
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

    public List<JobApplicationResponse> getAllApplications() {
        return jobApplicationRepository.findAll()
                .stream()
                .map(app -> JobApplicationResponse.builder()
                        .id(app.getId())
                        .userId(app.getUser().getId())
                        .indexNumber(app.getUser().getIndexNumber())
                        .firstName(app.getUser().getFirstName())
                        .lastName(app.getUser().getLastName())
                        .email(app.getUser().getEmail())
                        .profileImageName(app.getUser().getProfileImageName())
                        .cvFileName(app.getUser().getCvFileName())
                        .jobOfferId(app.getJobOffer().getId())
                        .jobTitle(app.getJobOffer().getTitle())
                        .status(app.getStatus().name())
                        .appliedAt(app.getAppliedAt().toString())
                        .build())
                .toList();
    }

    public void hireCandidate(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Aplikacja nie istnieje"));

        User user = application.getUser();

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Nie można zatrudnić administratora");
        }

        user.setRole(Role.EMPLOYEE);
        application.setStatus(ApplicationStatus.HIRED);

        userRepository.save(user);
        jobApplicationRepository.save(application);
    }

    public void applyForJob(Long jobOfferId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie istnieje"));

        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Oferta nie istnieje"));

        JobApplication application = JobApplication.builder()
                .user(user)
                .jobOffer(jobOffer)
                .status(ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .build();

        jobApplicationRepository.save(application);
    }
}