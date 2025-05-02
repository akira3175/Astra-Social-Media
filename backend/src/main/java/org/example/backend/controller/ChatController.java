package org.example.backend.controller;

import org.example.backend.entity.ChatMessage;
import org.example.backend.model.ChatUser;
import org.example.backend.service.ChatService;
import org.example.backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.io.InputStream;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @Autowired
    private CloudinaryService cloudinaryService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage message) {
        try {
            System.out.println("Received message to send: " + message);

            // Lưu tin nhắn vào database
            ChatMessage savedMessage = chatService.saveMessage(message);
            System.out.println("Message saved to database: " + savedMessage);

            // Gửi tin nhắn đến người nhận
            String receiverDestination = "/user/" + message.getReceiverId() + "/queue/messages";
            messagingTemplate.convertAndSend(receiverDestination, savedMessage);
            System.out.println("Message sent to receiver destination: " + receiverDestination);

            // Gửi tin nhắn về cho người gửi để xác nhận
            String senderDestination = "/user/" + message.getSenderId() + "/queue/messages";
            messagingTemplate.convertAndSend(senderDestination, savedMessage);
            System.out.println("Message sent to sender destination: " + senderDestination);

            // Gửi tin nhắn đến channel chung để cập nhật danh sách chat
            messagingTemplate.convertAndSend("/topic/public", savedMessage);
            System.out.println("Message sent to public channel");
        } catch (Exception e) {
            System.err.println("Error sending message: " + e.getMessage());
            e.printStackTrace();
            // Có thể thêm logic để thông báo lỗi cho client
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {
        try {
            System.out.println("Received file upload request");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("File type: " + file.getContentType());

            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of(
                        "status", 401,
                        "message", "Invalid or missing token",
                        "data", null,
                        "timestamp", System.currentTimeMillis()));
            }

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", 400,
                        "message", "File is empty",
                        "data", null,
                        "timestamp", System.currentTimeMillis()));
            }

            // Kiểm tra kích thước file (ví dụ: tối đa 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of(
                        "status", 400,
                        "message", "File size exceeds 10MB limit",
                        "data", null,
                        "timestamp", System.currentTimeMillis()));
            }

            String fileUrl = cloudinaryService.uploadFile(file);
            System.out.println("File uploaded successfully to Cloudinary: " + fileUrl);

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "message", "File uploaded successfully",
                    "data", Map.of("fileUrl", fileUrl),
                    "timestamp", System.currentTimeMillis()));
        } catch (IOException e) {
            System.err.println("Error uploading file to Cloudinary: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "status", 500,
                    "message", "Error uploading file: " + e.getMessage(),
                    "data", null,
                    "timestamp", System.currentTimeMillis()));
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "status", 500,
                    "message", "Unexpected error: " + e.getMessage(),
                    "data", null,
                    "timestamp", System.currentTimeMillis()));
        }
    }

    @GetMapping("/messages/{senderId}/{receiverId}")
    @ResponseBody
    public List<ChatMessage> getMessages(
            @PathVariable String senderId,
            @PathVariable String receiverId,
            @RequestParam(defaultValue = "20") int limit) {
        System.out.println("Getting messages between " + senderId + " and " + receiverId);
        List<ChatMessage> messages = chatService.getMessages(senderId, receiverId, limit);
        System.out.println("Returning " + messages.size() + " messages");
        return messages;
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ChatUser>> getChatUsers(
            @PathVariable String userId,
            @RequestHeader("Authorization") String token) {
        try {
            System.out.println("Received request for chat users with userId: " + userId);

            if (token == null || !token.startsWith("Bearer ")) {
                System.err.println("Invalid or missing token");
                return ResponseEntity.status(401).build();
            }

            if (userId == null || userId.trim().isEmpty()) {
                System.err.println("Invalid userId");
                return ResponseEntity.badRequest().build();
            }

            try {
                List<ChatUser> users = chatService.getChatUsers(userId);
                System.out.println("Successfully retrieved " + (users != null ? users.size() : 0) + " chat users");
                return ResponseEntity.ok(users != null ? users : new ArrayList<>());
            } catch (Exception e) {
                System.err.println("Error in chatService.getChatUsers: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(500).build();
            }
        } catch (Exception e) {
            System.err.println("Unexpected error in getChatUsers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<Integer> getUnreadCount(@PathVariable String userId) {
        try {
            int count = chatService.getUnreadCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        try {
            chatService.markAsRead(messageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/read-all/{userId}/{senderId}")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable String userId,
            @PathVariable String senderId) {
        try {
            chatService.markAllAsRead(userId, senderId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(@RequestParam String fileUrl) {
        try {
            // Tạo URL connection để tải file từ Cloudinary
            URL url = new URL(fileUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            // Thêm headers cho Cloudinary
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setRequestProperty("Accept", "*/*");

            // Xóa token từ URL nếu có
            String cleanUrl = fileUrl.split("\\?")[0];
            if (!cleanUrl.equals(fileUrl)) {
                url = new URL(cleanUrl);
                connection = (HttpURLConnection) url.openConnection();
                connection.setRequestMethod("GET");
                connection.setRequestProperty("User-Agent", "Mozilla/5.0");
                connection.setRequestProperty("Accept", "*/*");
            }

            // Đọc dữ liệu từ connection
            try (InputStream inputStream = connection.getInputStream()) {
                byte[] fileContent = inputStream.readAllBytes();

                // Lấy tên file từ URL
                String fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
                fileName = URLDecoder.decode(fileName, Charset.forName("UTF-8").toString());

                // Xác định Content-Type dựa vào phần mở rộng của file
                String contentType = URLConnection.guessContentTypeFromName(fileName);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                        .body(fileContent);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}