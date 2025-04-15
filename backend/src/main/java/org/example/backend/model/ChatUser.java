package org.example.backend.model;

import lombok.Data;

@Data
public class ChatUser {
    private String id;
    private String name;
    private String avatar;
    private String lastMessage;
    private String lastMessageTime;
    private Integer unreadCount;
}