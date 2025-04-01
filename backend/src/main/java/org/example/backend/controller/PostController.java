package org.example.backend.controller;

import org.example.backend.dto.ApiResponse;
import org.example.backend.entity.Image;
import org.example.backend.entity.Post;
import org.example.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.example.backend.dto.CreatePostRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Post>>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        ApiResponse<List<Post>> response = ApiResponse.<List<Post>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách bài đăng thành công")
                .data(posts)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> getPostById(@PathVariable Long id) {
        Optional<Post> post = postService.getPostById(id);
        if (post.isPresent()) {
            ApiResponse<Post> response = ApiResponse.<Post>builder()
                    .status(HttpStatus.OK.value())
                    .message("Lấy bài đăng thành công")
                    .data(post.get())
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.ok(response);
        } else {
            ApiResponse<Post> response = ApiResponse.<Post>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Không tìm thấy bài đăng")
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(@RequestBody CreatePostRequest request) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Image> imageEntities = new ArrayList<>();
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (String url : request.getImageUrls()) {
                Image image = Image.builder()
                        .url(url)
                        .build();
                imageEntities.add(image);
            }
        }

        Post createdPost = postService.createPost(email, request.getContent(), imageEntities);

        ApiResponse<Post> response = ApiResponse.<Post>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo bài đăng thành công")
                .data(createdPost)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long id,
            @RequestParam("content") String newContent) {

        Post updatedPost = postService.updatePost(id, newContent);
        ApiResponse<Post> response = ApiResponse.<Post>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật bài đăng thành công")
                .data(updatedPost)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(HttpStatus.NO_CONTENT.value())
                .message("Xóa bài đăng thành công")
                .data(null)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Post>>> getPostsByUserId(@PathVariable Long userId) {
        List<Post> posts = postService.getPostsByUserId(userId);
        ApiResponse<List<Post>> response = ApiResponse.<List<Post>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách bài đăng theo người dùng thành công")
                .data(posts)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reposts/{originalPostId}")
    public ResponseEntity<ApiResponse<List<Post>>> getReposts(@PathVariable Long originalPostId) {
        List<Post> reposts = postService.getReposts(originalPostId);
        ApiResponse<List<Post>> response = ApiResponse.<List<Post>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách repost thành công")
                .data(reposts)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/repost/{originalPostId}")
    public ResponseEntity<ApiResponse<Post>> createRepost(
            @PathVariable Long originalPostId,
            @RequestParam(value = "content", required = false) String content) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Post repost = postService.createRepost(originalPostId, email, content);

        ApiResponse<Post> response = ApiResponse.<Post>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo repost thành công")
                .data(repost)
                .timestamp(System.currentTimeMillis())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
