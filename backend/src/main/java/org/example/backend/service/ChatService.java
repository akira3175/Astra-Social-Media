package org.example.backend.service;

import lombok.extern.slf4j.Slf4j;

import org.example.backend.dto.ChatUserDTO;
import org.example.backend.entity.ChatMessage;
import org.example.backend.entity.User;
import org.example.backend.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Service for handling chat-related functionalities including messages and file uploads.
 */
@Slf4j
@Service
@Transactional
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserService userService;
    private final Path uploadPath;

    // File type patterns
    private static final Pattern IMAGE_PATTERN = Pattern.compile("\\.(jpg|jpeg|png|gif|webp)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern VIDEO_PATTERN = Pattern.compile("\\.(mp4|webm|mov)$", Pattern.CASE_INSENSITIVE);
    private static final Pattern DOCUMENT_PATTERN = Pattern.compile("\\.(pdf|doc|docx|txt)$", Pattern.CASE_INSENSITIVE);

    // Maximum allowed file size in bytes (10MB)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Autowired
    public ChatService(
            ChatMessageRepository chatMessageRepository,
            UserService userService,
            @Value("${app.upload.dir:${user.dir}/uploads}") String uploadDir) {
        this.chatMessageRepository = chatMessageRepository;
        this.userService = userService;
        this.uploadPath = Paths.get(uploadDir);

        createUploadDirectoryIfNeeded();
    }

    /**
     * Creates the upload directory if it doesn't exist.
     */
    private void createUploadDirectoryIfNeeded() {
        try {
            if (!Files.exists(uploadPath)) {
                log.info("Creating upload directory: {}", uploadPath);
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            log.error("Failed to create upload directory: {}", e.getMessage(), e);
        }
    }

    /**
     * Saves a new chat message.
     *
     * @param message The message to save
     * @return The saved message
     */
    public ChatMessage saveMessage(ChatMessage message) {
        try {
            log.debug("Saving message from {} to {}", message.getSender().getId(), message.getReceiver().getId());

            ChatMessage newMessage = ChatMessage.builder()
                    .sender(message.getSender())
                    .receiver(message.getReceiver())
                    .content(message.getContent())
                    .timestamp(ZonedDateTime.now())
                    .fileUrl(message.getFileUrl())
                    .fileType(message.getFileType())
                    .fileName(message.getFileName())
                    .isRead(false)
                    .build();

            // Handle file attachment information
            if (message.getFileUrl() != null && !message.getFileUrl().isEmpty()) {
                newMessage.setHasAttachment(true);
                newMessage.setAttachmentType(determineFileType(message.getFileUrl()));
            }

            ChatMessage savedMessage = chatMessageRepository.save(newMessage);
            log.info("Message saved successfully with ID: {}", savedMessage.getId());

            return savedMessage;
        } catch (Exception e) {
            log.error("Error saving message: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save message", e);
        }
    }

    /**
     * Determines the type of file based on its extension.
     *
     * @param fileUrl The URL of the file
     * @return The file type (image, video, document, or file)
     */
    private String determineFileType(String fileUrl) {
        if (fileUrl == null) {
            return "file";
        }

        String lowerCaseUrl = fileUrl.toLowerCase();

        if (IMAGE_PATTERN.matcher(lowerCaseUrl).find()) {
            return "image";
        } else if (VIDEO_PATTERN.matcher(lowerCaseUrl).find()) {
            return "video";
        } else if (DOCUMENT_PATTERN.matcher(lowerCaseUrl).find()) {
            return "document";
        } else {
            return "file";
        }
    }

    /**
     * Uploads a file to the server.
     *
     * @param file The file to upload
     * @return The URL of the uploaded file
     * @throws IOException If the file cannot be uploaded
     */
    public String uploadFile(MultipartFile file) throws IOException {
        log.info("Starting file upload process for {}", file.getOriginalFilename());

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            log.error("File size exceeds limit: {}", file.getSize());
            throw new IOException("File size exceeds 10MB limit");
        }

        // Validate file type
        String contentType = file.getContentType();
        log.debug("File content type: {}", contentType);

        List<String> allowedTypes = Arrays.asList(
                "image/", "application/pdf", "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "text/plain", "application/zip", "application/x-rar-compressed");

        boolean isAllowed = contentType != null &&
                allowedTypes.stream().anyMatch(type -> contentType.startsWith(type));

        if (!isAllowed) {
            log.error("Invalid file type: {}", contentType);
            throw new IOException("Invalid file type. Allowed types: images, PDF, Word, Excel, text, zip, rar");
        }

        // Generate unique filename and save file
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        log.debug("Saving file to: {}", filePath);

        Files.copy(file.getInputStream(), filePath);
        log.info("File saved successfully: {}", filePath);

        String fileUrl = "/uploads/" + fileName;
        return fileUrl;
    }

    /**
     * Gets messages between two users.
     *
     * @param senderId The ID of the first user
     * @param receiverId The ID of the second user
     * @param limit Maximum number of messages to return
     * @return List of messages between the two users
     */
    public List<ChatMessage> getMessages(String senderId, String receiverId, int limit) {
        List<ChatMessage> messages = chatMessageRepository
                .findMessagesBetweenUsers(senderId, receiverId,
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp")));

        // Sort messages by timestamp ascending for display
        messages.sort(Comparator.comparing(ChatMessage::getTimestamp));
        return messages;
    }

    /**
     * Gets a list of users that the specified user has chatted with.
     *
     * @param email The user email
     * @return List of chat users
     */
    public List<ChatUserDTO> getChatUsers(String email) {
        try {
            log.debug("Getting chat users for email: {}", email);

            if (email == null || email.trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }

            User user = userService.getUserByEmail(email).orElse(null);

            // Check if user exists
            if (user == null) {
                log.info("User not found with email: {}", email);
                return new ArrayList<>();
            }

            String userId = user.getId().toString();
            List<ChatMessage> messages = chatMessageRepository
                    .findBySenderIdOrReceiverIdOrderByTimestampDesc(userId);
            log.debug("Found {} messages", messages != null ? messages.size() : 0);

            if (messages == null || messages.isEmpty()) {
                return new ArrayList<>();
            }

            return buildChatUserList(userId, messages);
        } catch (Exception e) {
            log.error("Error in getChatUsers service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get chat users", e);
        }
    }

    /**
     * Builds a list of ChatUser objects from messages.
     *
     * @param userId The current user ID
     * @param messages List of messages
     * @return List of chat users
     */
    private List<ChatUserDTO> buildChatUserList(String userId, List<ChatMessage> messages) {
        Map<String, ChatUserDTO> userMap = new HashMap<>();

        for (ChatMessage message : messages) {
            try {
                User otherUser;
                if (message.getSender().getId().toString().equals(userId)) {
                    otherUser = message.getReceiver();
                } else {
                    otherUser = message.getSender();
                }
                
                String otherUserId = otherUser.getId().toString();

                if (!userMap.containsKey(otherUserId)) {
                    ChatUserDTO chatUser = createChatUser(userId, otherUser, message);
                    userMap.put(otherUserId, chatUser);
                }
            } catch (Exception e) {
                log.error("Error processing message: {}", e.getMessage(), e);
                // Continue processing other messages
            }
        }

        List<ChatUserDTO> result = new ArrayList<>(userMap.values());
        log.debug("Returning {} chat users", result.size());
        return result;
    }

    /**
     * Creates a ChatUser object from a message.
     *
     * @param currentUserId The current user ID
     * @param otherUser The other user entity
     * @param message The message
     * @return ChatUser object
     */
    private ChatUserDTO createChatUser(String currentUserId, User otherUser, ChatMessage message) {
        String otherUserId = otherUser.getId().toString();
        
        ChatUserDTO chatUser = new ChatUserDTO();
        chatUser.setId(otherUserId);
        chatUser.setFirstName(otherUser.getFirstName());
        chatUser.setLastName(otherUser.getLastName());
        chatUser.setLastMessage(message.getContent());
        chatUser.setLastMessageTime(message.getTimestamp().toString());
        chatUser.setAvatar(otherUser.getAvatar());

        int unreadCount = chatMessageRepository
                .countByReceiverIdAndSenderIdAndIsReadFalse(currentUserId, otherUserId);
        chatUser.setUnreadCount(unreadCount);

        return chatUser;
    }

    /**
     * Gets the count of unread messages for a user.
     *
     * @param userId The user ID
     * @return Count of unread messages
     */
    public int getUnreadCount(String userId) {
        return chatMessageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    /**
     * Marks a message as read.
     *
     * @param messageId The message ID
     */
    public void markAsRead(Long messageId) {
        chatMessageRepository.findById(messageId).ifPresent(message -> {
            message.setIsRead(true);
            chatMessageRepository.save(message);
            log.debug("Marked message {} as read", messageId);
        });
    }

    /**
     * Marks all messages from a sender to a receiver as read.
     *
     * @param userId The receiver ID
     * @param senderId The sender ID
     */
    public void markAllAsRead(String userId, String senderId) {
        List<ChatMessage> unreadMessages = chatMessageRepository
                .findByReceiverIdAndSenderIdAndIsReadFalse(userId, senderId);

        if (!unreadMessages.isEmpty()) {
            unreadMessages.forEach(message -> message.setIsRead(true));
            chatMessageRepository.saveAll(unreadMessages);
            log.debug("Marked {} messages as read from {} to {}", unreadMessages.size(), senderId, userId);
        }
    }
}