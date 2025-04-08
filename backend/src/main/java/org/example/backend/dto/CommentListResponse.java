package org.example.backend.dto;

import java.util.List;

import org.example.backend.entity.Comment;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommentListResponse {
    private List<CommentDTO> comments;
    private long totalCount;
}