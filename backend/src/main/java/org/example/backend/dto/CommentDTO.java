package org.example.backend.dto;

import java.util.Date;
import java.util.List;

import org.example.backend.entity.Image;
import org.example.backend.entity.User;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDTO {
    private Long id;
    private String content;
    private User user;
    private Long postId;
    private Date createdAt;
    private Date updatedAt;
    private List<User> likes;
    private Long likeCount;
    @JsonProperty("isLiked")
    private boolean isLiked;
    private Long parentId;
    private List<CommentDTO> replies;
    private List<Image> images;
}