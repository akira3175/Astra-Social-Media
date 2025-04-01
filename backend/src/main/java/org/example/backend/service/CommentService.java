package org.example.backend.service;

import org.example.backend.entity.Comment;
import org.example.backend.entity.Image;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.ImageRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ImageRepository imageRepository;

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    public Comment getCommentByIdOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
    }

    @Transactional
    public Comment createComment(Long postId, String email, String content, List<Image> images) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .user(user)
                .build();

        if (images != null && !images.isEmpty()) {
            for (Image image : images) {
                image.setComment(comment); // Set comment reference for each image
            }
            comment.setImages(images); // Set images list for the comment
        }

        return commentRepository.save(comment);
    }

    public Comment updateComment(Long id, String newContent) {
        return commentRepository.findById(id).map(comment -> {
            comment.setContent(newContent);
            return commentRepository.save(comment);
        }).orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }
}
