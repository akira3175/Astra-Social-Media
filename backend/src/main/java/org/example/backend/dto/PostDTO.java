// package org.example.backend.dto;

// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Data;
// import lombok.NoArgsConstructor;
// import org.example.backend.entity.Image;
// import org.example.backend.entity.User;
// import com.fasterxml.jackson.annotation.JsonFormat;

// import java.util.Date;
// import java.util.List;

// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class PostDTO {
//     private Long id;
//     private String content;
//     private User user;
//     private List<Image> images;
//     @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
//     private Date createdAt; // Chuyển thành string trong JSON
//     @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
//     private Date updatedAt; // Chuyển thành string trong JSON
//     private long likesCount;
//     private boolean liked;
//     private long commentsCount;
//     private boolean saved; // Thêm trường này nếu cần
// }