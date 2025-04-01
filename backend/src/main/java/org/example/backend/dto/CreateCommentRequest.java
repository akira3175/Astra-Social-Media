package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    private String content;
    private List<String> imageUrls;
    private Long parentCommentId; // Add parent comment ID field
}
