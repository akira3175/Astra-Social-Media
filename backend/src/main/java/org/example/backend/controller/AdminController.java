package org.example.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.example.backend.entity.User;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    // private final CommentService commentService;

    @GetMapping("/posts")
    public ResponseEntity<?> getPost() {
        return ResponseEntity.ok("List post");
    }

    @GetMapping("/comments")
    public ResponseEntity<?> getAllComment() {
        // List<Comment> comments = commentRepository.findAll();
        // return ResponseEntity.ok(comments);
        return ResponseEntity.ok("List comment");
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUser() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.unbanUser(userId));
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.banUser(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        Map<String, Long> stats = new HashMap<>();
        // fake data
        stats.put("totalPosts", 1000L);
        stats.put("lockedPosts", 100L);
        stats.put("totalComments", 1000L);
        stats.put("lockedComments", 100L);
        stats.put("totalUsers", (long)userService.getAllUsers().size());
        stats.put("bannedUsers", userService.getAllUsers().stream().filter(user -> !user.getIsActive()).count());
        return ResponseEntity.ok(stats);
    }
}
