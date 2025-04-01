package com.astrasocialmedia.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage message) {
        // Lưu tin nhắn vào database
        chatService.saveMessage(message);

        // Gửi tin nhắn đến người nhận
        messagingTemplate.convertAndSendToUser(
                message.getReceiverId(),
                "/queue/messages",
                message);

        // Gửi tin nhắn về cho người gửi để xác nhận
        messagingTemplate.convertAndSendToUser(
                message.getSenderId(),
                "/queue/messages",
                message);
    }

    @GetMapping("/api/messages/{senderId}/{receiverId}")
    @ResponseBody
    public List<ChatMessage> getMessages(
            @PathVariable String senderId,
            @PathVariable String receiverId,
            @RequestParam(defaultValue = "20") int limit) {
        return chatService.getMessages(senderId, receiverId, limit);
    }
}