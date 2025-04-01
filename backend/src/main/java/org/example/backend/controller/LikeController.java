package org.example.backend.controller;

import org.example.backend.dto.ApiResponse;
import org.example.backend.entity.Like;
import org.example.backend.entity.Post;
import org.example.backend.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Like>> getLikeById(@PathVariable Long id) {
        Optional<Like> like = likeService.getLikeById(id);
        if (like.isPresent()) {
            return ResponseEntity.ok(ApiResponse.<Like>builder()
                    .status(HttpStatus.OK.value())
                    .message("Lấy like thành công")
                    .data(like.get())
                    .timestamp(System.currentTimeMillis())
                    .build());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.<Like>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy like")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Post>> likePost(@PathVariable Long postId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Like like = likeService.likePost(userEmail, postId); // Lấy Like trước
    
        Post post = like.getPost(); // Lấy Post từ Like
    
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<Post>builder()
                .status(HttpStatus.CREATED.value())
                .message("Like bài đăng thành công")
                .data(post) // Trả về Post của Like
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @PostMapping("/comment/{commentId}")
    public ResponseEntity<ApiResponse<Like>> likeComment(@PathVariable Long commentId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Like createdLike = likeService.likeComment(userEmail, commentId);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<Like>builder()
                .status(HttpStatus.CREATED.value())
                .message("Like bình luận thành công")
                .data(createdLike)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLike(@PathVariable Long id) {
        likeService.deleteLike(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(ApiResponse.<Void>builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Xóa like thành công")
                .data(null)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @GetMapping("/post/{userId}/{postId}")
    public ResponseEntity<ApiResponse<Like>> getLikeByUserIdAndPostId(@PathVariable long userId, @PathVariable long postId) {
        Like like = likeService.getLikeByUserIdAndPostId(userId, postId);
        if (like != null) {
            return ResponseEntity.ok(ApiResponse.<Like>builder()
                    .status(HttpStatus.OK.value())
                    .message("Lấy like theo người dùng và bài đăng thành công")
                    .data(like)
                    .timestamp(System.currentTimeMillis())
                    .build());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.<Like>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy like")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
    }
}
