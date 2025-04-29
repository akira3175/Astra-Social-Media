package org.example.backend.service;

import org.example.backend.entity.ChatMessage;
import org.example.backend.model.ChatUser;
import org.example.backend.repository.ChatMessageRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

        @Autowired
        private ChatMessageRepository chatMessageRepository;

        @Autowired
        private UserRepository userRepository;

        private final Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads");

        public ChatMessage saveMessage(ChatMessage message) {
                try {
                        ChatMessage newMessage = new ChatMessage();
                        newMessage.setSenderId(message.getSenderId());
                        newMessage.setReceiverId(message.getReceiverId());
                        newMessage.setContent(message.getContent());
                        newMessage.setTimestamp(ZonedDateTime.now());
                        newMessage.setFileUrl(message.getFileUrl());
                        newMessage.setFileType(message.getFileType());
                        newMessage.setFileName(message.getFileName());
                        newMessage.setRead(false);

                        userRepository.findById(Long.parseLong(message.getSenderId())).ifPresent(user -> {
                                newMessage.setSenderName(user.getFirstName() + " " + user.getLastName());
                                newMessage.setSenderAvatar(user.getAvatar());
                        });

                        // Nếu tin nhắn có file, lưu thông tin file vào message
                        if (message.getFileUrl() != null && !message.getFileUrl().isEmpty()) {
                                newMessage.setHasAttachment(true);
                                newMessage.setAttachmentType(getFileType(message.getFileUrl()));
                        }

                        ChatMessage savedMessage = chatMessageRepository.save(newMessage);
                        System.out.println("Message saved successfully with ID: " + savedMessage.getId());

                        return savedMessage;
                } catch (Exception e) {
                        System.err.println("Error saving message: " + e.getMessage());
                        e.printStackTrace();
                        throw e;
                }
        }

        private String getFileType(String fileUrl) {
                String extension = fileUrl.substring(fileUrl.lastIndexOf(".") + 1).toLowerCase();
                if (extension.matches("(jpg|jpeg|png|gif|webp)")) {
                        return "image";
                } else if (extension.matches("(mp4|webm|mov)")) {
                        return "video";
                } else if (extension.matches("(pdf|doc|docx|txt)")) {
                        return "document";
                } else {
                        return "file";
                }
        }

        public String uploadFile(MultipartFile file) throws IOException {
                try {
                        System.out.println("Starting file upload process");
                        System.out.println("Upload path: " + uploadPath);

                        if (!Files.exists(uploadPath)) {
                                System.out.println("Creating upload directory");
                                Files.createDirectories(uploadPath);
                                System.out.println("Created upload directory: " + uploadPath);
                        }

                        // Kiểm tra kích thước file
                        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
                                System.err.println("File size exceeds limit: " + file.getSize());
                                throw new IOException("File size exceeds 10MB limit");
                        }

                        // Kiểm tra loại file
                        String contentType = file.getContentType();
                        System.out.println("File content type: " + contentType);

                        // Danh sách các loại file được phép
                        List<String> allowedTypes = Arrays.asList(
                                        "image/", "application/pdf", "application/msword",
                                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                        "application/vnd.ms-excel",
                                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        "text/plain", "application/zip", "application/x-rar-compressed");

                        boolean isAllowed = contentType != null &&
                                        allowedTypes.stream().anyMatch(type -> contentType.startsWith(type));

                        if (!isAllowed) {
                                System.err.println("Invalid file type: " + contentType);
                                throw new IOException(
                                                "Invalid file type. Allowed types: images, PDF, Word, Excel, text, zip, rar");
                        }

                        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                        Path filePath = uploadPath.resolve(fileName);
                        System.out.println("Saving file to: " + filePath);

                        // Lưu file
                        Files.copy(file.getInputStream(), filePath);
                        System.out.println("File saved successfully: " + filePath);

                        String fileUrl = "/uploads/" + fileName;
                        System.out.println("Returning file URL: " + fileUrl);
                        return fileUrl;
                } catch (IOException e) {
                        System.err.println("Error saving file: " + e.getMessage());
                        e.printStackTrace();
                        throw e;
                }
        }

        public List<ChatMessage> getMessages(String senderId, String receiverId, int limit) {
                System.out.println("Getting messages between " + senderId + " and " + receiverId);

                List<ChatMessage> messages = chatMessageRepository
                                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampDesc(
                                                senderId, receiverId, senderId, receiverId,
                                                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp")));

                System.out.println("Found " + messages.size() + " messages");

                messages.sort(Comparator.comparing(ChatMessage::getTimestamp));
                return messages;
        }

        public List<ChatUser> getChatUsers(String userId) {
                try {
                        System.out.println("Getting chat users for userId: " + userId);

                        if (userId == null || userId.trim().isEmpty()) {
                                throw new IllegalArgumentException("User ID cannot be null or empty");
                        }

                        // Kiểm tra xem userId có tồn tại trong database không
                        if (!userRepository.existsById(Long.parseLong(userId))) {
                                System.out.println("User not found with ID: " + userId);
                                return new ArrayList<>();
                        }

                        List<ChatMessage> messages = chatMessageRepository
                                        .findBySenderIdOrReceiverIdOrderByTimestampDesc(userId);
                        System.out.println("Found " + (messages != null ? messages.size() : 0) + " messages");

                        if (messages == null || messages.isEmpty()) {
                                return new ArrayList<>();
                        }

                        Map<String, ChatUser> userMap = new HashMap<>();
                        for (ChatMessage message : messages) {
                                try {
                                        String otherUserId = message.getSenderId().equals(userId)
                                                        ? message.getReceiverId()
                                                        : message.getSenderId();

                                        if (!userMap.containsKey(otherUserId)) {
                                                ChatUser chatUser = new ChatUser();
                                                chatUser.setId(otherUserId);
                                                chatUser.setLastMessage(message.getContent());
                                                chatUser.setLastMessageTime(message.getTimestamp().toString());

                                                int unreadCount = chatMessageRepository
                                                                .countByReceiverIdAndSenderIdAndReadFalse(userId,
                                                                                otherUserId);
                                                chatUser.setUnreadCount(unreadCount);

                                                userRepository.findById(Long.parseLong(otherUserId)).ifPresent(user -> {
                                                        chatUser.setName(
                                                                        user.getFirstName() + " " + user.getLastName());
                                                        chatUser.setAvatar(user.getAvatar());
                                                });

                                                userMap.put(otherUserId, chatUser);
                                        }
                                } catch (Exception e) {
                                        System.err.println("Error processing message: " + e.getMessage());
                                        e.printStackTrace();
                                        continue;
                                }
                        }

                        List<ChatUser> result = new ArrayList<>(userMap.values());
                        System.out.println("Returning " + result.size() + " chat users");
                        return result;
                } catch (Exception e) {
                        System.err.println("Error in getChatUsers service: " + e.getMessage());
                        e.printStackTrace();
                        throw e;
                }
        }

        public int getUnreadCount(String userId) {
                return chatMessageRepository.countByReceiverIdAndReadFalse(userId);
        }

        public void markAsRead(Long messageId) {
                chatMessageRepository.findById(messageId).ifPresent(message -> {
                        message.setRead(true);
                        chatMessageRepository.save(message);
                });
        }

        public void markAllAsRead(String userId, String senderId) {
                List<ChatMessage> unreadMessages = chatMessageRepository
                                .findByReceiverIdAndSenderIdAndReadFalse(userId, senderId);

                for (ChatMessage message : unreadMessages) {
                        message.setRead(true);
                }

                chatMessageRepository.saveAll(unreadMessages);
        }
}