package com.backend.service;

import java.io.ByteArrayInputStream;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.backend.entity.ApplicationStatus;
import com.backend.entity.JobApplication;
import com.backend.entity.JobOffer;
import com.backend.entity.User;
import com.backend.repository.JobApplicationRepository;
import com.backend.repository.JobOfferRepository;
import com.backend.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class HrServiceContractTest {

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ContractService contractService;

    @InjectMocks
    private HrService hrService;

    @Test
    void sendContractShouldPersistUploadedFileForCandidate() throws Exception {
        User user = User.builder()
                .id(1L)
                .email("candidate@example.com")
                .contractSigned(false)
                .build();

        JobApplication application = JobApplication.builder()
                .id(11L)
                .user(user)
                .jobOffer(JobOffer.builder().id(99L).build())
                .status(ApplicationStatus.CONTRACT_SIGNING)
                .build();

        MockMultipartFile uploadedFile = new MockMultipartFile(
                "file",
                "umowa.pdf",
                "application/pdf",
                new ByteArrayInputStream("pdf-content".getBytes())
        );

        when(jobApplicationRepository.findById(11L)).thenReturn(Optional.of(application));
        when(contractService.getStorageDirectory()).thenReturn("uploads/contracts");

        hrService.sendContract(11L, uploadedFile);

        assertNotNull(user.getContractFileName());
        assertTrue(user.getContractFileName().endsWith("umowa.pdf") || user.getContractFileName().contains("_umowa.pdf"));
        assertFalse(user.getContractSigned());
        verify(userRepository).save(user);
    }
}