package org.example.backend.controller;

import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.PostDTO;
import org.example.backend.dto.CommentDTO;
import org.example.backend.entity.Like;
import org.example.backend.entity.User;
import org.example.backend.service.LikeService;
import org.example.backend.service.PostService;
import org.example.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;
    @Autowired
    private PostService postService; 
    @Autowired
    private CommentService commentService;

    // Lấy Like theo 
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Like>> getLikeById(@PathVariable Long id) {
        Optional<Like> like = likeService.getLikeById(id);
        return like.map(value -> ResponseEntity.ok(ApiResponse.<Like>builder()
                        .status(HttpStatus.OK.value())
                        .message("Lấy like thành công")
                        .data(value)
                        .timestamp(System.currentTimeMillis())
                        .build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.<Like>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Không tìm thấy like")
                        .data(null)
                        .timestamp(System.currentTimeMillis())
                        .build()));
    }

    // Like bài viết - Returns updated PostDTO
    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<PostDTO>> likePost(@PathVariable Long postId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        likeService.likePost(userEmail, postId); 

        PostDTO updatedPost = postService.getPostDtoById(postId, userEmail); 
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<PostDTO>builder()
                .status(HttpStatus.CREATED.value())
                .message("Like bài viết thành công")
                .data(updatedPost)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Unlike bài viết - Returns updated PostDTO
    @DeleteMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<PostDTO>> unlikePost(@PathVariable Long postId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        likeService.unlikePost(userEmail, postId); 

        // Fetch the updated post details after unliking
        PostDTO updatedPost = postService.getPostDtoById(postId, userEmail);
        return ResponseEntity.ok(ApiResponse.<PostDTO>builder() 
                .status(HttpStatus.OK.value())
                .message("Unlike bài viết thành công")
                .data(updatedPost)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Like bình luận - Returns updated CommentDTO
    @PostMapping("/comment/{commentId}")
    public ResponseEntity<ApiResponse<CommentDTO>> likeComment(@PathVariable Long commentId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        likeService.likeComment(userEmail, commentId);

        CommentDTO updatedComment = commentService.getCommentDtoById(commentId, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.<CommentDTO>builder()
                .status(HttpStatus.CREATED.value())
                .message("Like bình luận thành công")
                .data(updatedComment)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Unlike bình luận - Returns updated CommentDT
    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<ApiResponse<CommentDTO>> unlikeComment(@PathVariable Long commentId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        likeService.unlikeComment(userEmail, commentId);

        CommentDTO updatedComment = commentService.getCommentDtoById(commentId, userEmail);
        return ResponseEntity.ok(ApiResponse.<CommentDTO>builder()
                .status(HttpStatus.OK.value())
                .message("Unlike bình luận thành công")
                .data(updatedComment)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Xoá like theo ID
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

    // Đếm số like bài viết
    @GetMapping("/post/{postId}/count")
    public ResponseEntity<ApiResponse<Long>> countLikesByPostId(@PathVariable Long postId) {
        Long count = likeService.countLikesByPostId(postId);
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .status(HttpStatus.OK.value())
                .message("Số lượt like bài viết")
                .data(count)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Đếm số like bình luận
    @GetMapping("/comment/{commentId}/count")
    public ResponseEntity<ApiResponse<Long>> countLikesByCommentId(@PathVariable Long commentId) {
        Long count = likeService.countLikesByCommentId(commentId);
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .status(HttpStatus.OK.value())
                .message("Số lượt like bình luận")
                .data(count)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Lấy danh sách user like bài viết
    @GetMapping("/post/{postId}/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsersWhoLikedPost(@PathVariable Long postId) {
        List<User> users = likeService.getUsersWhoLikedPost(postId);
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                .status(HttpStatus.OK.value())
                .message("Danh sách người like bài viết")
                .data(users)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Lấy danh sách user like bình luận
    @GetMapping("/comment/{commentId}/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsersWhoLikedComment(@PathVariable Long commentId) {
        List<User> users = likeService.getUsersWhoLikedComment(commentId);
        return ResponseEntity.ok(ApiResponse.<List<User>>builder()
                .status(HttpStatus.OK.value())
                .message("Danh sách người like bình luận")
                .data(users)
                .timestamp(System.currentTimeMillis())
                .build());
    }
}
