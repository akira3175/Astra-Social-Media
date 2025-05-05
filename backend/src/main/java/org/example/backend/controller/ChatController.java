package org.example.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ChatMessageDTO;
import org.example.backend.dto.ChatUserDTO;
import org.example.backend.entity.ChatMessage;
import org.example.backend.entity.User;
import org.example.backend.mapper.ChatMessageMapper;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.ChatService;
import org.example.backend.service.CloudinaryService;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.example.backend.util.ImageUtils;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for chat-related endpoints and WebSocket message handling.
 */
@Slf4j
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

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    /**
     * WebSocket endpoint for sending messages.
     *
     * @param message The message to send
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage message) {
        try {
            log.debug("Received message to send: {}", message);

            // Save message to database
            ChatMessage savedMessage = chatService.saveMessage(message);
            log.debug("Message saved to database: {}", savedMessage);

            // Send message to receiver
            String receiverDestination = "/user/" + savedMessage.getReceiver().getId() + "/queue/messages";
            messagingTemplate.convertAndSend(receiverDestination, savedMessage);
            log.debug("Message sent to receiver: {}", receiverDestination);

            // Send confirmation to sender
            String senderDestination = "/user/" + savedMessage.getSender().getId() + "/queue/messages";
            messagingTemplate.convertAndSend(senderDestination, savedMessage);
            log.debug("Message sent to sender: {}", senderDestination);

            // Send message to public channel for chat list updates
            messagingTemplate.convertAndSend("/topic/public", savedMessage);
            log.debug("Message sent to public channel");
        } catch (Exception e) {
            log.error("Error sending message: {}", e.getMessage(), e);
        }
    }

    /**
     * Uploads a file to Cloudinary.
     *
     * @param file The file to upload
     * @param token Authentication token
     * @return Response with file URL
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String token) {

        log.debug("Received file upload request: {} ({})", file.getOriginalFilename(), file.getSize());

        // Validate file
        if (file.isEmpty()) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "File is empty");
        }

        // Check file size (10MB limit)
        if (file.getSize() > 10 * 1024 * 1024) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "File size exceeds 10MB limit");
        }

        try {
            String fileUrl = cloudinaryService.uploadFile(file);
            log.info("File uploaded successfully to Cloudinary: {}", fileUrl);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("fileUrl", fileUrl);

            return createSuccessResponse("File uploaded successfully", responseData);
        } catch (IOException e) {
            log.error("Error uploading file to Cloudinary: {}", e.getMessage(), e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error uploading file: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error during file upload: {}", e.getMessage(), e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error: " + e.getMessage());
        }
    }

    /**
     * Gets messages between two users.
     *
     * @param receiverId The ID of the second user
     * @param limit Maximum number of messages to return
     * @return List of messages
     */
    @GetMapping("/messages/{receiverId}")
    @ResponseBody
    public List<ChatMessageDTO> getMessages(
            @RequestHeader("Authorization") String token,
            @PathVariable String receiverId,
            @RequestParam(defaultValue = "20") int limit,
            HttpServletRequest request) {

        token = token.replace("Bearer ", "").trim();
        String email = jwtUtil.extractEmail(token);
        User sender = userService.getUserByEmail(email).orElse(null);

        List<ChatMessage> messages = chatService.getMessages(sender.getId().toString(), receiverId, limit);

        List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(ChatMessageMapper::toDTO)
                .toList();

        for (ChatMessageDTO messageDTO : messageDTOs) {
            messageDTO.setSender(ImageUtils.addDomainToImage(messageDTO.getSender(), request));
            messageDTO.setReceiver(ImageUtils.addDomainToImage(messageDTO.getReceiver(), request));
        }

        return messageDTOs;
    }

    /**
     * Gets a list of users that the specified user has chatted with.
     *
     * @param token Authentication token
     * @return List of chat users
     */
    @GetMapping("/users/")
    public ResponseEntity<List<ChatUserDTO>> getChatUsers(
            @RequestHeader("Authorization") String token,
            HttpServletRequest request) {

        token = token.replace("Bearer ", "").trim();

        try {
            String email = jwtUtil.extractEmail(token);
            List<ChatUserDTO> users = chatService.getChatUsers(email);
            log.debug("Retrieved {} chat users for user {}", users.size(), email);
            for (ChatUserDTO user : users) {
                user.setAvatar(ImageUtils.addDomainToImage(user.getAvatar(), request));
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error retrieving chat users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Gets the count of unread messages for a user.
     *
     * @param userId The user ID
     * @return Count of unread messages
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<Integer> getUnreadCount(@PathVariable String userId) {
        try {
            int count = chatService.getUnreadCount(userId);
            log.debug("Unread count for user {}: {}", userId, count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error getting unread count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marks a message as read.
     *
     * @param messageId The message ID
     * @return Empty response
     */
    @PostMapping("/read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        try {
            chatService.markAsRead(messageId);
            log.debug("Marked message {} as read", messageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking message as read: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Marks all messages from a sender to a receiver as read.
     *
     * @param userId The receiver ID
     * @param senderId The sender ID
     * @return Empty response
     */
    @PostMapping("/read-all/{userId}/{senderId}")
    public ResponseEntity<?> markAllAsRead(
            @PathVariable String userId,
            @PathVariable String senderId) {
        try {
            chatService.markAllAsRead(userId, senderId);
            log.debug("Marked all messages from {} to {} as read", senderId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error marking messages as read: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Downloads a file from Cloudinary.
     *
     * @param fileUrl The URL of the file
     * @return File content
     */
    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadFile(@RequestParam String fileUrl) {
        try {
            log.debug("Downloading file from: {}", fileUrl);

            // Extract clean URL without query parameters
            String cleanUrl = fileUrl.split("\\?")[0];

            // Create URL connection
            URL url = new URL(cleanUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("User-Agent", "Mozilla/5.0");
            connection.setRequestProperty("Accept", "*/*");

            // Read file content
            try (InputStream inputStream = connection.getInputStream()) {
                byte[] fileContent = inputStream.readAllBytes();

                // Extract filename from URL
                String fileName = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
                fileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);

                // Determine content type
                String contentType = URLConnection.guessContentTypeFromName(fileName);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                log.debug("File downloaded successfully: {} ({})", fileName, contentType);

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                        .body(fileContent);
            }
        } catch (Exception e) {
            log.error("Error downloading file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Creates a success response.
     *
     * @param message Success message
     * @param data Response data
     * @return Response entity
     */
    private ResponseEntity<?> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", message);
        response.put("data", data);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    /**
     * Creates an error response.
     *
     * @param status HTTP status
     * @param message Error message
     * @return Response entity
     */
    private ResponseEntity<?> createErrorResponse(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", status.value());
        response.put("message", message);
        response.put("data", null);
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.status(status).body(response);
    }
}