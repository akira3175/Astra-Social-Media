package org.example.backend.controller;

import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.CommentListResponse;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Image;
import org.example.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.example.backend.dto.CreateCommentRequest;
import org.example.backend.dto.UpdateCommentRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Comment>>> getAllComments() {
        List<Comment> comments = commentService.getAllComments();
        ApiResponse<List<Comment>> response = ApiResponse.<List<Comment>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách bình luận thành công")
                .data(comments)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Comment>> getCommentById(@PathVariable Long id) {
        Optional<Comment> comment = commentService.getCommentById(id);
        if (comment.isPresent()) {
            ApiResponse<Comment> response = ApiResponse.<Comment>builder()
                    .status(HttpStatus.OK.value())
                    .message("Lấy bình luận thành công")
                    .data(comment.get())
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.ok(response);
        } else {
            ApiResponse<Comment> response = ApiResponse.<Comment>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy bình luận")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping("/{postId}")
    public ResponseEntity<ApiResponse<Comment>> createComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest request) {
    
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
    
        List<Image> imageEntities = new ArrayList<>();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (String url : request.getImageUrls()) {
                Image image = Image.builder().url(url).build();
                imageEntities.add(image);
            }
        }
    
        Comment createdComment = commentService.createComment(
                postId,
                email,
                request.getContent(),
                imageEntities,
                request.getParentCommentId()
        );
    
        ApiResponse<Comment> response = ApiResponse.<Comment>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo bình luận thành công")
                .data(createdComment)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Comment>> updateComment(
            @PathVariable Long id,
            @RequestBody UpdateCommentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        try {
            Comment updatedComment = commentService.updateComment(id, email, request.getContent());
            
            ApiResponse<Comment> response = ApiResponse.<Comment>builder()
                    .status(HttpStatus.OK.value())
                    .message("Cập nhật bình luận thành công")
                    .data(updatedComment)
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ApiResponse<Comment> response = ApiResponse.<Comment>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        commentService.softDeleteComment(id, email);
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Đã xóa bình luận")
                .data(null)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<CommentListResponse>> getCommentsByPostId(@PathVariable Long postId) {
        CommentListResponse commentData = commentService.getCommentsAndCountByPostId(postId);

        ApiResponse<CommentListResponse> response = ApiResponse.<CommentListResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách bình luận theo bài đăng thành công")
                .data(commentData) 
                .timestamp(System.currentTimeMillis())
                .build();

        return ResponseEntity.ok(response);
    }
}
