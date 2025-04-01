package org.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        // Tạo tên file ngẫu nhiên
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(UPLOAD_DIR + fileName);

        // Lưu file vào thư mục
        Files.createDirectories(filePath.getParent());
        try {
            file.transferTo(new File(filePath.toString()));
            System.out.println("File saved successfully!");
        } catch (IOException e) {
            System.err.println("Error saving file: " + e.getMessage());
            throw e;
        }

        return "/uploads/" + fileName; // Trả về đường dẫn file
    }
}

