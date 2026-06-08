package com.backend.controller;

import com.backend.dto.UpdateProfileRequest;
import com.backend.dto.UserResponse;
import com.backend.entity.User;
import com.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;

    private final String cvUploadDir = "uploads/cv";
    private final String photoUploadDir = "uploads/photos";

    @GetMapping("/me")
    public UserResponse getMe(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Brak uwierzytelnionego użytkownika");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .cvFileName(user.getCvFileName())
                .profileImageName(user.getProfileImageName())
                .build();
    }

    @PutMapping("/me")
    public ResponseEntity<String> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Brak autoryzacji");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        userRepository.save(user);

        return ResponseEntity.ok("Profil został zaktualizowany");
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadProfilePhoto(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Brak autoryzacji");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Nie wybrano pliku");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return ResponseEntity.badRequest().body("Nieprawidłowa nazwa pliku");
        }

        String lowerName = originalFilename.toLowerCase();
        if (!(lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png"))) {
            return ResponseEntity.badRequest().body("Dozwolone są tylko pliki JPG, JPEG i PNG");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Path uploadPath = Paths.get(photoUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;
        Path filePath = uploadPath.resolve(uniqueFileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        user.setProfileImageName(uniqueFileName);
        userRepository.save(user);

        return ResponseEntity.ok("Zdjęcie profilowe zostało zapisane");
    }

    @DeleteMapping("/me/photo")
    public ResponseEntity<String> deleteProfilePhoto(Authentication authentication) throws IOException {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Brak autoryzacji");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if (user.getProfileImageName() != null && !user.getProfileImageName().isBlank()) {
            Path photoPath = Paths.get(photoUploadDir).resolve(user.getProfileImageName());
            Files.deleteIfExists(photoPath);
            user.setProfileImageName(null);
            userRepository.save(user);
        }

        return ResponseEntity.ok("Zdjęcie profilowe zostało usunięte");
    }

    @GetMapping("/me/photo")
    public ResponseEntity<Resource> getProfilePhoto(Authentication authentication) throws MalformedURLException {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if (user.getProfileImageName() == null || user.getProfileImageName().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(photoUploadDir).resolve(user.getProfileImageName());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String fileName = user.getProfileImageName().toLowerCase();

        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (fileName.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
    }

    @PostMapping(value = "/me/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadCv(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body("Brak autoryzacji");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Nie wybrano pliku");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().body("Dozwolone są tylko pliki PDF");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        Path uploadPath = Paths.get(cvUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;
        Path filePath = uploadPath.resolve(uniqueFileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        user.setCvFileName(uniqueFileName);
        userRepository.save(user);

        return ResponseEntity.ok("CV zostało przesłane pomyślnie");
    }

    @GetMapping("/me/cv")
    public ResponseEntity<Resource> downloadCv(Authentication authentication) throws MalformedURLException {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if (user.getCvFileName() == null || user.getCvFileName().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(cvUploadDir).resolve(user.getCvFileName());
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + user.getCvFileName() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}