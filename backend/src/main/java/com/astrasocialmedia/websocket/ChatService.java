package com.astrasocialmedia.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getMessages(String senderId, String receiverId, int limit) {
        return chatMessageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByTimestampDesc(
                senderId, receiverId,
                receiverId, senderId,
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp")));
    }
}