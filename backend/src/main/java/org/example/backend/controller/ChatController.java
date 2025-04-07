package org.example.backend.controller;

import org.example.backend.entity.ChatMessage;
import org.example.backend.model.ChatUser;
import org.example.backend.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

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
    public ResponseEntity<List<ChatUser>> getChatUsers(@PathVariable String userId) {
        List<ChatUser> users = chatService.getChatUsers(userId);
        return ResponseEntity.ok(users);
    }
}