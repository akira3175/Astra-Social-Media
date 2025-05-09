package org.example.backend.service;

import org.example.backend.entity.Image;
import org.example.backend.dto.PostDTO;
import org.example.backend.entity.Post;
import org.example.backend.elasticsearch.document.PostDocument;
import org.example.backend.elasticsearch.repository.PostESRepository;
import org.example.backend.entity.User;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.LikeRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.backend.mapper.PostMapper;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Date;
import java.util.Comparator;

@Service
public class PostService {
    private static final long EDIT_TIME_LIMIT_MINUTES = 30; // 30 phút

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private PostESRepository postESRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LikeRepository likeRepository; // Inject LikeRepository
    @Autowired
    private CommentRepository commentRepository; // Inject CommentRepository
    @Autowired
    private PostMapper postMapper;

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

    }

    @Transactional(readOnly = true)
    public List<PostDTO> getAllPostDtos(String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        List<Post> posts = postRepository.findByIsDeletedFalse();
        return posts.stream()
                .map(post -> postMapper.toDto(post, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Post> getPostById(Long id) {
        Optional<Post> postOpt = postRepository.findByIdAndIsDeletedFalse(id);
        postOpt.ifPresent(post -> {
            post.setLikeCount(likeRepository.countByPostId(post.getId()));
            post.setTotalCommentCount(commentRepository.countByPostId(post.getId()));
        });
        return postOpt;
    }

    public Post getPostByIdOrThrow(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // No changes needed in this file, the method is already there

    @Transactional
    public Post createPost(String email, String content, List<Image> images) {
        User user = getCurrentUser(email);

        Post post = Post.builder()
                .content(content)
                .user(user)
                .build();

        if (images != null && !images.isEmpty()) {
            for (Image image : images) {
                image.setPost(post); // Set post reference for each image
            }
            post.setImages(images); // Set images list for the post
        }

        post = postRepository.save(post);
        savePostToES(post.getId());

        return post;
    }

    @Transactional
    public Post updatePost(Long id, String email, String newContent) {
        if (id == null) {
            throw new IllegalArgumentException("Post id cannot be null");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        if (newContent == null || newContent.trim().isEmpty()) {
            throw new IllegalArgumentException("Content cannot be null or empty");
        }

        final Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User currentUser = getCurrentUser(email);
        if (!existingPost.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this post");
        }

        // Kiểm tra thời gian dựa trên lần sửa cuối hoặc thời gian tạo nếu chưa từng sửa
        long currentTime = System.currentTimeMillis();
        long lastEditTime = existingPost.getUpdatedAt() != null
                ? existingPost.getUpdatedAt().getTime()
                : existingPost.getCreatedAt().getTime();
        long timeDifferenceMinutes = (currentTime - lastEditTime) / (60 * 1000);

        if (timeDifferenceMinutes < EDIT_TIME_LIMIT_MINUTES) {
            throw new RuntimeException(
                    String.format("Phải đợi %d phút sau lần sửa trước mới có thể sửa lại",
                            EDIT_TIME_LIMIT_MINUTES));
        }

        existingPost.setContent(newContent.trim());
        existingPost.setUpdatedAt(new Date());

        try {
            final Post updatedPost = postRepository.save(existingPost);
            savePostToES(updatedPost.getId());
            return updatedPost;
        } catch (Exception e) {
            throw new RuntimeException("Error saving updated post: " + e.getMessage());
        }
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<Post> getPostsByUserId(Long userId) {
        List<Post> posts = postRepository.findByUserIdAndIsDeletedFalse(userId);
        posts.forEach(post -> {
            post.setLikeCount(likeRepository.countByPostId(post.getId()));
            post.setTotalCommentCount(commentRepository.countByPostId(post.getId()));
        });
        return posts;
    }

    @Transactional(readOnly = true)
    public List<PostDTO> getPostsByUserEmail(String userEmail, String currentUserEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User currentUser = getCurrentUser(currentUserEmail);

        List<Post> posts = postRepository.findByUserIdAndIsDeletedFalse(user.getId());
        posts.sort(Comparator.comparing(Post::getCreatedAt).reversed());
        return posts.stream()
                .map(post -> postMapper.toDto(post, currentUser))
                .collect(Collectors.toList());
    }

    public List<Post> getReposts(Long originalPostId) {
        return postRepository.findByOriginalPostId(originalPostId);
    }

    public Post createRepost(Long originalPostId, String email, String content) {
        User user = getCurrentUser(email);
        Post originalPost = postRepository.findById(originalPostId)
                .orElseThrow(() -> new RuntimeException("Original post not found"));

        Post repost = Post.builder()
                .content(content)
                .user(user)
                .originalPost(originalPost)
                .build();

        repost = postRepository.save(repost);
        savePostToES(repost.getId());

        return repost;
    }

    // Method to get PostDTO by ID, including like status for the current user
    @Transactional(readOnly = true) // Use readOnly transaction
    public PostDTO getPostDtoById(Long postId, String currentUserEmail) {
        Post post = getPostByIdOrThrow(postId);
        User currentUser = getCurrentUser(currentUserEmail);

        // Check if the current user liked this post
        // boolean likedByCurrentUser = likeRepository.findByUserAndPost(currentUser,
        // post).isPresent();

        // Get counts
        // Use the helper method for conversion
        return postMapper.toDto(post, currentUser);
    }

    @Transactional
    public void softDeletePost(Long postId) {
        Post post = getPostByIdOrThrow(postId);
        post.setDeleted(true);
        post.setDeletedAt(new Date());
        postRepository.save(post);
        savePostToES(postId);
    }

    public Page<PostDocument> searchPosts(String keyword, User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        if (user.getIsStaff()) {
            return postESRepository.findByContentContaining(keyword, pageable);
        }
        return postESRepository.findByContentContainingAndIsDeletedFalse(keyword, pageable);
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getPageOfPostDtos(String currentUserEmail, Pageable pageable) {
        User currentUser = getCurrentUser(currentUserEmail);
        Page<Post> postPage = postRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable);

        return postPage.map(post -> postMapper.toDto(post, currentUser));
    }

    public void savePostToES(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        PostDocument postDocument = postMapper.toDocument(post);
        postESRepository.save(postDocument);
    }

    public void syncAllPostsToES() {
        List<Post> posts = postRepository.findAll();
        List<PostDocument> documents = posts.stream()
                .map(postMapper::toDocument)
                .toList();
        postESRepository.saveAll(documents);
    }


    public Long countAllPosts() {
        return postRepository.countAll();
    }

    public Long countLockedPosts() {
        return postRepository.countByIsDeletedTrue();
    }

    public void lockPost(Long postId) {
        Post post = getPostByIdOrThrow(postId);
        post.setDeleted(true);
        post.setDeletedAt(new Date());
        postRepository.save(post);
        savePostToES(postId);
    }

    public void unlockPost(Long postId) {
        Post post = getPostByIdOrThrow(postId);
        post.setDeleted(false);
        post.setDeletedAt(null);
        postRepository.save(post);
        savePostToES(postId);
    }
}
