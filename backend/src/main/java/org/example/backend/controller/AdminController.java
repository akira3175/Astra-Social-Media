package org.example.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;
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

@RestController
@RequestMapping("/api/admin/")
@RequiredArgsConstructor
public class AdminController {
    private final UserService userService;
    private final CommentService commentService;
    private final PostService postService;



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



    @GetMapping("/user/getAllUser")
    public ResponseEntity<?> getAllUser() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/user/{userId}/unban")
    public ResponseEntity<?> unbanUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.unbanUser(userId));
    }

    @PostMapping("/user/{userId}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.banUser(userId));
    }




    // Post
    @GetMapping("/post/getAllPost")
    public ResponseEntity<?> getPost() {
        List<PostDTO> posts = postService.getAllPostDtos(null);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/comment/getAllComment")
    public ResponseEntity<?> getAllComment() {
        List<Comment> comments = commentService.getAllComments();
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/comment/{commentId}/lock")
    public ResponseEntity<?> lockComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok("Comment deleted");
    }

    
}
