package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.entity.NotificationType;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderAvatarUrl;
    private NotificationType type;
    private Long postId;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
