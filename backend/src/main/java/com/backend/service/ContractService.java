package com.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import com.backend.entity.JobApplication;

@Service
public class ContractService {

    private static final String CONTRACTS_DIR = "uploads/contracts";

    public String generateContractPdf(JobApplication application) {
        try {
            Path storagePath = Paths.get(CONTRACTS_DIR);
            Files.createDirectories(storagePath);

            String fileName = "contract_" + application.getId() + "_" + UUID.randomUUID() + ".pdf";
            Path filePath = storagePath.resolve(fileName);

            String contractText = String.format(
                    "Umowa o pracę\n"
                            + "Imię i nazwisko: %s %s\n"
                            + "Email: %s\n"
                            + "Stanowisko: %s\n"
                            + "Status aplikacji: %s\n"
                            + "Data wygenerowania: %s\n",
                    application.getUser().getFirstName(),
                    application.getUser().getLastName(),
                    application.getUser().getEmail(),
                    application.getJobOffer().getTitle(),
                    application.getStatus(),
                    java.time.LocalDate.now()
            );

            try (PDDocument document = new PDDocument()) {
                PDPage page = new PDPage();
                document.addPage(page);

                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    contentStream.setFont(PDType1Font.HELVETICA, 12);
                    contentStream.beginText();
                    contentStream.newLineAtOffset(50, 750);
                    for (String line : contractText.split("\\n")) {
                        contentStream.showText(line);
                        contentStream.newLineAtOffset(0, -18);
                    }
                    contentStream.endText();
                }

                document.save(filePath.toFile());
            }

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Nie udało się wygenerować umowy", e);
        }
    }

    public String getStorageDirectory() {
        return CONTRACTS_DIR;
    }
}