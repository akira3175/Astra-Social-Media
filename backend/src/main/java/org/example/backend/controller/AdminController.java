package org.example.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.example.backend.security.RequireAdmin;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

import org.example.backend.entity.User;
import org.example.backend.entity.Comment;
import org.example.backend.dto.PostDTO;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.UserService;
import org.example.backend.service.CommentService;
import org.example.backend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.example.backend.dto.ApiResponse;
import org.example.backend.entity.Post;

@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final CommentService commentService;
    private final PostService postService;

    @RequireAdmin
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getAdminStats() {
        Map<String, Long> stats = new HashMap<>();
        // fake data
        stats.put("totalPosts", 1000L);
        stats.put("lockedPosts", 100L);
        stats.put("totalComments", 1000L);
        stats.put("lockedComments", 100L);
        stats.put("totalUsers", (long) userService.getAllUsers().size());
        stats.put("bannedUsers", userService.getAllUsers().stream().filter(user -> !user.getIsActive()).count());
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(stats)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @RequireAdmin
    @GetMapping("/users/getAllUser")
    public ResponseEntity<ApiResponse<Object>> getAllUser() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(users)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @RequireAdmin
    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<ApiResponse<Object>> unbanUser(@PathVariable Long userId) {
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(userService.unbanUser(userId))
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @RequireAdmin
    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<ApiResponse<Object>> banUser(@PathVariable Long userId) {
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(userService.banUser(userId))
                .timestamp(System.currentTimeMillis())
                .build());
    }

    // Post
    @RequireAdmin
    @GetMapping("/posts/getAllPost")
    public ResponseEntity<ApiResponse<Object>> getAllPost() {
        List<User> users = userService.getAllUsers();
        
        List<Map<Long, List<Post>>> ListUserPost = new ArrayList<>();
        
        for (User user : users) {
            Map<Long, List<Post>> userPost = new HashMap<>();
            userPost.put(user.getId(), postService.getPostsByUserId(user.getId()));
            ListUserPost.add(userPost);
        }
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(ListUserPost)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @RequireAdmin
    @GetMapping("/comments/getAllComment")
    public ResponseEntity<ApiResponse<Object>> getAllComment() {
        List<Comment> comments = commentService.getAllComments();
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(comments)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @RequireAdmin
    @PostMapping("/comments/{commentId}/delete")
    public ResponseEntity<ApiResponse<Object>> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data("Comment deleted")
                .timestamp(System.currentTimeMillis())
                .build());
    }

}
