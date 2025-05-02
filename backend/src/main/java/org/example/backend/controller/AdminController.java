package org.example.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import org.example.backend.security.JwtUtil;
import org.example.backend.security.RequireAdmin;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Calendar;
import java.text.ParseException;

import org.example.backend.entity.User;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Like;
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
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Map<String, String> tokens = userService.login(email, password);
        User user = userService.getUserInfo(email);
        if (!user.getIsStaff()) {
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
    @GetMapping("/statsAt")
    public ResponseEntity<ApiResponse<Object>> getAdminStatsAt(
            @RequestParam("start") String startDateStr,
            @RequestParam("end") String endDateStr) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);
            

            Map<String, Long> stats = new HashMap<>();
            stats.put("totalPosts", postRepository.findAll().stream().filter(post -> post.getCreatedAt().after(startDate) && post.getCreatedAt().before(endDate)).count());
            stats.put("lockedPosts", postRepository.findAll().stream().filter(post -> post.getDeletedAt() != null && post.getCreatedAt().after(startDate) && post.getCreatedAt().before(endDate)).count());
            stats.put("totalComments", commentRepository.findAll().stream().filter(comment -> comment.getCreatedAt().after(startDate) && comment.getCreatedAt().before(endDate)).count());
            stats.put("totalUsers", userRepository.findAll().stream().filter(user -> Date.from(user.getDateJoined().atZone(ZoneId.systemDefault()).toInstant()).after(startDate) && Date.from(user.getDateJoined().atZone(ZoneId.systemDefault()).toInstant()).before(endDate)).count());
            stats.put("bannedUsers", userRepository.findAll().stream().filter(user -> user.getIsActive() == false && Date.from(user.getLastLogin().atZone(ZoneId.systemDefault()).toInstant()).after(startDate) && Date.from(user.getLastLogin().atZone(ZoneId.systemDefault()).toInstant()).before(endDate)).count());

            return ResponseEntity.ok().body(ApiResponse.builder()
                    .status(200)
                    .message("Success")
                    .data(stats)
                    .timestamp(System.currentTimeMillis())
                    .build());
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .status(400)
                    .message("Invalid date format. Please use dd-MM-yyyy format")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
    }

    @RequireAdmin
    @GetMapping("/users/getAllUser")
    public ResponseEntity<ApiResponse<Object>> getAllUser() {
        List<User> users = userService.getAllUsers().stream().filter(user -> user.getIsStaff() != true).collect(Collectors.toList());
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(users)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @RequireAdmin
    @GetMapping("/users/getAllUserAt")
    public ResponseEntity<ApiResponse<Object>> getAllNewUser(@RequestParam("start") String startDateStr, @RequestParam("end") String endDateStr) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);

            List<User> users = userService.getAllUsers().stream().filter(user -> Date.from(user.getDateJoined().atZone(ZoneId.systemDefault()).toInstant()).after(startDate) && Date.from(user.getDateJoined().atZone(ZoneId.systemDefault()).toInstant()).before(endDate) && user.getIsStaff() != true).collect(Collectors.toList());
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(users)
                .timestamp(System.currentTimeMillis())
                .build());
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .status(400)
                    .message("Invalid date format. Please use dd-MM-yyyy format")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
    }

    @RequireAdmin
    @GetMapping("/users/getUserLoginToday")
    public ResponseEntity<ApiResponse<Object>> getUserLoginToday() {
        List<User> users = userService.getAllUsers().stream().filter(user -> user.getLastLogin().isAfter(LocalDateTime.now().minusDays(1))).collect(Collectors.toList());
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
        List<Post> posts = postService.getAllPosts();
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(posts)
                .timestamp(System.currentTimeMillis())
                .build());
    }
    

    @RequireAdmin
    @GetMapping("/posts/getAllPostAt")
    public ResponseEntity<ApiResponse<Object>> getAllPostAt(@RequestParam("start") String startDateStr, @RequestParam("end") String endDateStr) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);

            List<User> users = userService.getAllUsers();
            List<Map<Long, List<Post>>> ListUserPost = new ArrayList<>();
            
            for (User user : users) {
                List<Post> filteredPosts = postService.getPostsByUserId(user.getId())
                    .stream()
                    .filter(post -> post.getCreatedAt().after(startDate) && post.getCreatedAt().before(endDate))
                    .collect(Collectors.toList());
                
                if (!filteredPosts.isEmpty()) {
                    Map<Long, List<Post>> userPost = new HashMap<>();
                    userPost.put(user.getId(), filteredPosts);
                    ListUserPost.add(userPost);
                }
            }
            
            return ResponseEntity.ok().body(ApiResponse.builder()
                    .status(200)
                    .message("Success")
                    .data(ListUserPost)
                    .timestamp(System.currentTimeMillis())
                    .build());
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .status(400)
                    .message("Invalid date format. Please use dd-MM-yyyy format")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
    }

    @RequireAdmin
    @PostMapping("/posts/{postId}/lock")
    public ResponseEntity<ApiResponse<Object>> lockPost(@PathVariable Long postId) {
        postService.lockPost(postId);
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data("Post locked")
                .timestamp(System.currentTimeMillis())
                .build());
    }

    @RequireAdmin
    @PostMapping("/posts/{postId}/unlock")
    public ResponseEntity<ApiResponse<Object>> unlockPost(@PathVariable Long postId) {
        postService.unlockPost(postId);
        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data("Post unlocked")
                .timestamp(System.currentTimeMillis())
                .build());
    }
    

    // @RequireAdmin
    // @GetMapping("/comments/getAllComment")
    // public ResponseEntity<ApiResponse<Object>> getAllComment() {
    //     List<Comment> comments = commentService.getAllComments();
    //     return ResponseEntity.ok().body(ApiResponse.builder()
    //             .status(200)
    //             .message("Success")
    //             .data(comments)
    //             .timestamp(System.currentTimeMillis())
    //             .build());
    // }

    @RequireAdmin
    @GetMapping("/comments/getAllCommentAt")
    public ResponseEntity<ApiResponse<Object>> getAllCommentAt(@RequestParam("start") String startDateStr, @RequestParam("end") String endDateStr) {
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy");
            Date startDate = dateFormat.parse(startDateStr);
            Date endDate = dateFormat.parse(endDateStr);

            List<Post> posts = postService.getAllPosts();
            List<PostSummaryDTO> filteredPosts = posts.stream()
                .map(this::convertToSummaryDTO)
                .filter(post -> post.getComments().stream()
                    .anyMatch(comment -> {
                        Date commentDate = comment.getCreatedAt();
                        return commentDate.after(startDate) && commentDate.before(endDate);
                    }))
                .collect(Collectors.toList());

            return ResponseEntity.ok().body(ApiResponse.builder()
                    .status(200)
                    .message("Success")
                    .data(filteredPosts)
                    .timestamp(System.currentTimeMillis())
                    .build());
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(ApiResponse.builder()
                    .status(400)
                    .message("Invalid date format. Please use dd-MM-yyyy format")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build());
        }
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

    private CustomUserDTO convertUser(User user) {
        CustomUserDTO dto = new CustomUserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatar(user.getAvatar());
        return dto;
    }
    

    private PostSummaryDTO convertToSummaryDTO(Post post) {
        PostSummaryDTO dto = new PostSummaryDTO();
        dto.setIdPost(post.getId());
        dto.setUserPost(convertUser(post.getUser()));
        dto.setComments(post.getComments().stream()
            .filter(c -> c.getParentComment() == null)
            .map(this::convertComment)
            .collect(Collectors.toList()));
        return dto;
    }
    
    private CommentDTO convertComment(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setLikes(comment.getLikes());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setIdComment(comment.getId());
        dto.setContent(comment.getContent());
        dto.setUserComment(convertUser(comment.getUser()));
        dto.setReplies(comment.getReplies().stream()
            .map(this::convertComment)
            .collect(Collectors.toList()));
        return dto;
    }


    @RequireAdmin
    @GetMapping("/comments/getAllComment")
    public ResponseEntity<ApiResponse<Object>> getAllComment() {
        List<Post> posts = postService.getAllPosts();
        List<PostSummaryDTO> simplifiedPosts = posts.stream()
                .filter(c -> c.getComments().size() > 0)
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok().body(ApiResponse.builder()
                .status(200)
                .message("Success")
                .data(simplifiedPosts)
                .timestamp(System.currentTimeMillis())
                .build());
    }

    

}

// PostSummaryDTO.java
@Data
class PostSummaryDTO {
    private Long idPost;
    private CustomUserDTO userPost;
    private List<CommentDTO> comments;
}

// CommentDTO.java
@Data
class CommentDTO {
    private Long idComment;
    private String content;
    private List<Like> likes;
    private CustomUserDTO userComment;
    private List<CommentDTO> replies;
    private Date createdAt;
    private Date updatedAt;
}

@Data
class CustomUserDTO {
    private Long id;
    private String name;
    private String email;
    private String avatar;
}

