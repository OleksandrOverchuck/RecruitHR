package com.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final ContractService contractService;

    public JobOfferResponse createJobOffer(CreateJobOfferRequest request, String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie istnieje"));

        JobOffer jobOffer = JobOffer.builder()
                .title(request.getTitle())
                .location(request.getLocation())
                .level(request.getLevel())
                .description(request.getDescription())
                .createdBy(hrUser)
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
                .ownerId(hrUser.getId())
                .ownerEmail(hrUser.getEmail())
                .build();
    }

    public List<JobOfferResponse> getAllJobOffers() {
        return jobOfferRepository.findAll()
                .stream()
                .map(job -> {
                    Long ownerId = null;
                    String ownerEmail = null;
                    if (job.getCreatedBy() != null) {
                        ownerId = job.getCreatedBy().getId();
                        ownerEmail = job.getCreatedBy().getEmail();
                    }
                    return JobOfferResponse.builder()
                            .id(job.getId())
                            .title(job.getTitle())
                            .location(job.getLocation())
                            .level(job.getLevel())
                            .description(job.getDescription())
                            .active(job.isActive())
                            .ownerId(ownerId)
                            .ownerEmail(ownerEmail)
                            .build();
                })
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
                        .contractSent(app.getUser().getContractSent())
                        .contractSigned(app.getUser().getContractSigned())
                        .appliedAt(app.getAppliedAt().toString())
                        .build())
                .toList();
    }

    public void acceptCandidate(Long applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Aplikacja nie istnieje"));

        User user = application.getUser();

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Nie można zaakceptować administratora");
        }

        application.setStatus(ApplicationStatus.ACCEPTED);
        jobApplicationRepository.save(application);
    }

    public void updateApplicationStatus(Long applicationId, ApplicationStatus status) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Aplikacja nie istnieje"));

        if (application.getStatus() == ApplicationStatus.REJECTED) {
            throw new RuntimeException("Nie można zmienić statusu odrzuconej aplikacji");
        }

        if (status == ApplicationStatus.HIRED) {
            User user = application.getUser();
            if (user.getRole() != Role.EMPLOYEE) {
                user.setRole(Role.EMPLOYEE);
                userRepository.save(user);
            }
        }

        application.setStatus(status);
        jobApplicationRepository.save(application);
    }

    public void sendContract(Long applicationId, MultipartFile file) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Aplikacja nie istnieje"));

        if (application.getStatus() != ApplicationStatus.CONTRACT_SIGNING) {
            throw new RuntimeException("Umowę można załączyć tylko dla kandydatów w etapie podpisania umowy");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Nie wybrano pliku umowy");
        }

        String originalFileName = file.getOriginalFilename();
        if (originalFileName == null || !originalFileName.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("Dozwolony jest tylko plik PDF");
        }

        try {
            Path uploadPath = Paths.get(contractService.getStorageDirectory());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
            Path targetPath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            User user = application.getUser();
            user.setContractFileName(uniqueFileName);
            user.setContractSent(true);
            user.setContractSigned(false);
            userRepository.save(user);
        } catch (IOException e) {
            throw new RuntimeException("Nie udało się zapisać pliku umowy", e);
        }
    }

    @Transactional
    public void deleteJobOffer(Long jobOfferId, String hrEmail) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Oferta pracy nie istnieje"));

        if (!jobOffer.getCreatedBy().getEmail().equals(hrEmail)) {
            throw new RuntimeException("Nie masz uprawnień do usunięcia tej oferty");
        }

        if (jobOffer.isActive()) {
            throw new RuntimeException("Najpierw dezaktywuj ofertę, aby móc ją usunąć");
        }

        jobApplicationRepository.deleteByJobOfferId(jobOfferId);
        jobOfferRepository.delete(jobOffer);
    }

    public void deactivateJobOffer(Long jobOfferId, String hrEmail) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Oferta pracy nie istnieje"));

        if (!jobOffer.getCreatedBy().getEmail().equals(hrEmail)) {
            throw new RuntimeException("Nie masz uprawnień do dezaktywacji tej oferty");
        }

        if (!jobOffer.isActive()) {
            throw new RuntimeException("Oferta jest już dezaktywowana");
        }

        jobOffer.setActive(false);
        jobOfferRepository.save(jobOffer);
    }

    public void activateJobOffer(Long jobOfferId, String hrEmail) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Oferta pracy nie istnieje"));

        if (!jobOffer.getCreatedBy().getEmail().equals(hrEmail)) {
            throw new RuntimeException("Nie masz uprawnień do aktywacji tej oferty");
        }

        if (jobOffer.isActive()) {
            throw new RuntimeException("Oferta jest już aktywna");
        }

        jobOffer.setActive(true);
        jobOfferRepository.save(jobOffer);
    }

    public void updateJobOffer(Long jobOfferId, CreateJobOfferRequest request, String hrEmail) {
        JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                .orElseThrow(() -> new RuntimeException("Oferta pracy nie istnieje"));

        if (!jobOffer.getCreatedBy().getEmail().equals(hrEmail)) {
            throw new RuntimeException("Nie masz uprawnień do edycji tej oferty");
        }

        jobOffer.setTitle(request.getTitle());
        jobOffer.setLocation(request.getLocation());
        jobOffer.setLevel(request.getLevel());
        jobOffer.setDescription(request.getDescription());

        jobOfferRepository.save(jobOffer);
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