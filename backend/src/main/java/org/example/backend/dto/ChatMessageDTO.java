package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDTO {
    private Long id;
    private UserDTO sender;
    private UserDTO receiver;
    private String content;
    private String timestamp;
    private String fileUrl;
    private String fileType;
    private String fileName;
    private Boolean isRead;
    private Boolean hasAttachment;
    private String attachmentType;
}
