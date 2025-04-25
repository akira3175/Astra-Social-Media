package org.example.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.example.backend.security.JwtUtil;
import org.example.backend.security.RequireAdmin;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;

import org.example.backend.entity.User;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.entity.Comment;
import org.example.backend.service.UserService;
import org.example.backend.service.CommentService;
import org.example.backend.service.PostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Map<String, String> tokens = userService.login(email, password);
        User user = userService.getUserInfo(email);
        if (!user.getIsSuperUser()) {
            return ResponseEntity.status(401).body(ApiResponse.builder()
                .status(401)
                .message("You are not Admin")
                .data(null)
                .timestamp(System.currentTimeMillis())
                .build());
        }

        if (tokens != null) {
            return ResponseEntity.ok(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(tokens)
                .timestamp(System.currentTimeMillis())
                .build());
        }

        return ResponseEntity.status(401).body(ApiResponse.builder()
            .status(402)
            .message("Invalid email or password")
            .data(null)
            .timestamp(System.currentTimeMillis())
            .build());
    }

    @PostMapping("/login/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Refresh token is required");
        }

        return refreshTokenRepository.findByToken(refreshToken)
                .map(token -> {
                    if (token.getExpiryDate().isBefore(Instant.now())) {
                        refreshTokenRepository.delete(token); // Xóa token hết hạn
                        return ResponseEntity.status(401).body("Refresh token expired");
                    }

                    String email = jwtUtil.extractEmail(refreshToken);
                    if (jwtUtil.isTokenValid(refreshToken, email)) {
                        String newAccessToken = jwtUtil.generateAccessToken(email);
                        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
                    } else {
                        return ResponseEntity.status(401).body("Invalid refresh token");
                    }
                })
                .orElse(ResponseEntity.status(401).body("Refresh token not found"));
    }

    @RequireAdmin
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Object>> getAdminStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalPosts", postService.countAllPosts());
        stats.put("lockedPosts", postService.countLockedPosts());
        stats.put("totalComments", commentService.countAllComments());
        stats.put("totalUsers", userService.countAllUsers());
        stats.put("bannedUsers", userService.countLockedUsers());
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
