package org.example.backend.mapper;

import org.example.backend.dto.ChatMessageDTO;
import org.example.backend.entity.ChatMessage;

public class ChatMessageMapper {

    public static ChatMessageDTO toDTO(ChatMessage message) {
        if (message == null) return null;

        return ChatMessageDTO.builder()
                .id(message.getId())
                .sender(UserMapper.toDTO(message.getSender()))
                .receiver(UserMapper.toDTO(message.getReceiver()))
                .content(message.getContent())
                .timestamp(message.getTimestamp() != null ? message.getTimestamp().toString() : null)
                .fileUrl(message.getFileUrl())
                .fileType(message.getFileType())
                .fileName(message.getFileName())
                .isRead(message.getIsRead())
                .hasAttachment(message.getHasAttachment())
                .attachmentType(message.getAttachmentType())
                .build();
    }
}
