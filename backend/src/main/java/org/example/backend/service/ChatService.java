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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatMessage saveMessage(ChatMessage message) {
        try {
            // Tạo tin nhắn mới với ID tự động tăng
            ChatMessage newMessage = new ChatMessage();
            newMessage.setSenderId(message.getSenderId());
            newMessage.setReceiverId(message.getReceiverId());
            newMessage.setContent(message.getContent());
            newMessage.setTimestamp(LocalDateTime.now());

            // Lấy thông tin người gửi
            userRepository.findById(Long.parseLong(message.getSenderId())).ifPresent(user -> {
                newMessage.setSenderName(user.getFirstName() + " " + user.getLastName());
                newMessage.setSenderAvatar(user.getAvatar());
            });

            // Lưu tin nhắn vào database
            ChatMessage savedMessage = chatMessageRepository.save(newMessage);
            System.out.println("Message saved successfully with ID: " + savedMessage.getId());

            return savedMessage;
        } catch (Exception e) {
            System.err.println("Error saving message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<ChatMessage> getMessages(String senderId, String receiverId, int limit) {
        System.out.println("Getting messages between " + senderId + " and " + receiverId);

        // Lấy tin nhắn từ cả hai chiều
        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampDesc(
                        senderId, receiverId, senderId, receiverId,
                        PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp")));

        System.out.println("Found " + messages.size() + " messages");

        // Sắp xếp tin nhắn theo thời gian tăng dần
        messages.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));
        return messages;
    }

    public List<ChatUser> getChatUsers(String userId) {
        // Lấy tất cả tin nhắn của user
        List<ChatMessage> messages = chatMessageRepository.findBySenderIdOrReceiverIdOrderByTimestampDesc(userId);

        // Tạo map để lưu thông tin người dùng và tin nhắn cuối cùng
        Map<String, ChatUser> userMap = new HashMap<>();

        for (ChatMessage message : messages) {
            String otherUserId = message.getSenderId().equals(userId) ? message.getReceiverId() : message.getSenderId();

            if (!userMap.containsKey(otherUserId)) {
                ChatUser chatUser = new ChatUser();
                chatUser.setId(otherUserId);
                chatUser.setLastMessage(message.getContent());
                chatUser.setLastMessageTime(message.getTimestamp().toString());
                chatUser.setUnreadCount(0);

                // Lấy thông tin user từ UserRepository
                userRepository.findById(Long.parseLong(otherUserId)).ifPresent(user -> {
                    chatUser.setName(user.getFirstName() + " " + user.getLastName());
                    chatUser.setAvatar(user.getAvatar());
                });

                userMap.put(otherUserId, chatUser);
            }
        }

        // Chuyển map thành list và sắp xếp theo thời gian tin nhắn cuối
        return userMap.values().stream()
                .sorted(Comparator.comparing(ChatUser::getLastMessageTime).reversed())
                .collect(Collectors.toList());
    }
}