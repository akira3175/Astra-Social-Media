package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.entity.Image;
import org.example.backend.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private Long id;
    private String content;
    private User user; // Assuming User entity itself is okay to expose, otherwise map to a UserDTO
    private List<Image> images; // Assuming Image entity itself is okay, otherwise map to ImageDTO
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC") // Added timezone
    private Date createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC") // Added timezone
    private Date updatedAt;
    private long likesCount;
    private boolean liked; // Status if the current user liked this post
    private long commentsCount;
    // private boolean saved; // Keep commented if not implemented yet
    @JsonInclude(JsonInclude.Include.NON_NULL) // Chỉ include nếu originalPost không null
    private PostDTO originalPost; // Thêm trường này để chứa thông tin bài gốc
    private boolean isDeleted;
}
