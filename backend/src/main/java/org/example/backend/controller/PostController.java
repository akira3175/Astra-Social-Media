package org.example.backend.controller;

import org.example.backend.dto.ApiResponse;
import org.example.backend.entity.Image;
import org.example.backend.entity.Post;
import org.example.backend.elasticsearch.document.PostDocument;
import org.example.backend.entity.User;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.PostService;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.example.backend.dto.CreatePostRequest;
import org.example.backend.dto.PostDTO;
import org.example.backend.dto.UpdatePostRequest;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostDTO>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();

            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                    : Sort.Direction.ASC;

            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

            // Sử dụng getPageOfPostDtos thay vì getAllPostDtos
            Page<PostDTO> postsPage = postService.getPageOfPostDtos(email, pageable);

            ApiResponse<Page<PostDTO>> response = ApiResponse.<Page<PostDTO>>builder()
                    .status(HttpStatus.OK.value())
                    .message("Lấy danh sách bài đăng thành công")
                    .data(postsPage)
                    .timestamp(System.currentTimeMillis())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            ApiResponse<Page<PostDTO>> errorResponse = ApiResponse.<Page<PostDTO>>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Lỗi khi lấy danh sách bài đăng: " + e.getMessage())
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    // @GetMapping("/user/{userId}")
    // public ResponseEntity<ApiResponse<List<Post>>> getPostsByUserId(@PathVariable
    // Long userId) {
    // List<Post> posts = postService.getPostsByUserId(userId);
    // ApiResponse<List<Post>> response = ApiResponse.<List<Post>>builder()
    // .status(HttpStatus.OK.value())
    // .message("Lấy danh sách bài đăng theo người dùng thành công")
    // .data(posts)
    // .timestamp(System.currentTimeMillis())
    // .build();
    // return ResponseEntity.ok(response);
    // }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDTO>> getPostById(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            PostDTO postDto = postService.getPostDtoById(id, email);

            ApiResponse<PostDTO> response = ApiResponse.<PostDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Lấy bài đăng thành công")
                    .data(postDto)
                    .timestamp(System.currentTimeMillis())
                    .build();

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            ApiResponse<PostDTO> response = ApiResponse.<PostDTO>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message(e.getMessage())
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
    public ResponseEntity<ApiResponse<PostDTO>> updatePost(
            @PathVariable Long id,
            @RequestBody UpdatePostRequest request) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            Post updatedPost = postService.updatePost(id, email, request.getContent());
            PostDTO postDto = postService.getPostDtoById(updatedPost.getId(), email);

            ApiResponse<PostDTO> response = ApiResponse.<PostDTO>builder()
                    .status(HttpStatus.OK.value())
                    .message("Cập nhật nội dung bài đăng thành công")
                    .data(postDto)
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ApiResponse<PostDTO> response = ApiResponse.<PostDTO>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(e.getMessage())
                    .data(null)
                    .timestamp(System.currentTimeMillis())
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.softDeletePost(id);
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Đã đánh dấu xóa bài đăng")
                .data(null)
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

    // Endpoint to create a repost
    @PostMapping("/repost/{originalPostId}")
    public ResponseEntity<ApiResponse<PostDTO>> createRepost(
            @PathVariable Long originalPostId,
            @RequestBody(required = false) CreatePostRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String content = (request != null && request.getContent() != null) ? request.getContent() : null;

        Post repostEntity = postService.createRepost(originalPostId, email, content);

        PostDTO repostDto = postService.getPostDtoById(repostEntity.getId(), email);

        ApiResponse<PostDTO> response = ApiResponse.<PostDTO>builder()
                .status(HttpStatus.CREATED.value())
                .message("Tạo repost thành công")
                .data(repostDto)
                .timestamp(System.currentTimeMillis())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<ApiResponse<List<PostDTO>>> getPostsByUserEmail(@PathVariable String email) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        List<PostDTO> posts = postService.getPostsByUserEmail(email, currentUserEmail);
        ApiResponse<List<PostDTO>> response = ApiResponse.<List<PostDTO>>builder()
                .status(HttpStatus.OK.value())
                .message("Posts retrieved successfully")
                .data(posts)
                .timestamp(System.currentTimeMillis())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PostDocument>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userService.getUserInfo(email);

        Page<PostDocument> result = null;// postService.searchPosts(keyword, user, page, size);
        return ResponseEntity.ok(result);
    }

}
