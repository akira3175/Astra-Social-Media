package org.example.backend.service;

import org.example.backend.entity.Image;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.ImageRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import org.example.backend.entity.Post; // Import Post

@Service
public class PostService {


    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImageRepository imageRepository;

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(Long id) {
        return postRepository.findById(id);
    }

    public Post getPostByIdOrThrow(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
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

        return postRepository.save(post);
    }

    public Post updatePost(Long id, String newContent) {
        return postRepository.findById(id).map(post -> {
            post.setContent(newContent);
            return postRepository.save(post);
        }).orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    public List<Post> getPostsByUserId(Long userId) {
        return postRepository.findByUserId(userId);
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

        return postRepository.save(repost);
    }
}
