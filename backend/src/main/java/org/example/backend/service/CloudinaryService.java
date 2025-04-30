package org.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    public String uploadFile(MultipartFile file) throws IOException {
        try {
            System.out.println("Starting file upload process");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());

            Map<String, Object> options = new HashMap<>();

            // Xác định loại file
            String contentType = file.getContentType();
            String fileName = file.getOriginalFilename();
            String extension = fileName != null ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase() : "";

            System.out.println("File extension: " + extension);

            // Nếu là file ảnh
            if (contentType != null && contentType.startsWith("image/")) {
                System.out.println("Processing image file");
                options.put("resource_type", "image");
                options.put("folder", "chat_images");
            }
            // Nếu là file PDF
            else if (extension.equals("pdf")) {
                System.out.println("Processing PDF file");
                options.put("resource_type", "raw");
                options.put("folder", "chat_files");
                options.put("format", "pdf");
                options.put("public_id", fileName);
            }
            // Nếu là file văn bản
            else if (extension.equals("txt")) {
                System.out.println("Processing text file");
                options.put("resource_type", "raw");
                options.put("folder", "chat_files");
                options.put("format", "txt");
                options.put("public_id", fileName);
            }
            // Các file khác
            else {
                System.out.println("Processing other file type");
                options.put("resource_type", "raw");
                options.put("folder", "chat_files");
                options.put("public_id", fileName);
            }

            System.out.println("Upload options: " + options);

            // Upload file
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            System.out.println("Upload result: " + uploadResult);

            String secureUrl = (String) uploadResult.get("secure_url");
            System.out.println("Secure URL: " + secureUrl);

            return secureUrl;
        } catch (Exception e) {
            System.err.println("Error uploading file to Cloudinary: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi upload file: " + e.getMessage());
        }
    }

    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}