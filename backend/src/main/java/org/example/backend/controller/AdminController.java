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
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
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
        return ResponseEntity.ok("users");
    }

    // @GetMapping("/users/${userId}/unban")
    // public ResponseEntity<?> unbanUser(@PathVariable Long userId) {
    //     // userService.unbanUser(userId);
    //     return ResponseEntity.ok("Unban user");
    // }

    // @GetMapping("/users/${userId}/ban")
    // public ResponseEntity<?> banUser(@PathVariable Long userId) {
    //     // userService.banUser(userId);
    //     return ResponseEntity.ok("Ban user");
    // }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminStats() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("totalPosts", 1000);
        stats.put("lockedPosts", 100);
        stats.put("totalComments", 1000);
        stats.put("lockedComments", 100);
        stats.put("totalUsers", 3);
        stats.put("bannedUsers", 0);
        return ResponseEntity.ok(stats);
    }
}
