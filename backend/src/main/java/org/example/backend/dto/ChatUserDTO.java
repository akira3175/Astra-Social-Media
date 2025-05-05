package org.example.backend.dto;

import lombok.Data;

@Data
public class ChatUserDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String avatar;
    private String lastMessage;
    private String lastMessageTime;
    private Integer unreadCount;
}