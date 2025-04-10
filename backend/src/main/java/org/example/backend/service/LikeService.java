package org.example.backend.service;

import org.example.backend.entity.Like;
import org.example.backend.repository.LikeRepository;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private UserService userService; 
    @Autowired
    private PostService postService; 
    @Autowired
    private CommentService commentService; 


    public void deleteLike(Long id) {
        likeRepository.deleteById(id);
    }

    @Transactional
    public Like likePost(String userEmail, Long postId) {
        User user = userService.getUserByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found")); 
        Post post = postService.getPostByIdOrThrow(postId); 

        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post); 
        if (existingLike.isPresent()) {
            return existingLike.get(); 
        }

        Like like = Like.builder()
                .user(user)
                .post(post)
                .comment(null)
                .build();
        return likeRepository.save(like);
    }

    @Transactional
    public Like likeComment(String userEmail, Long commentId) {
        User user = userService.getUserByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentService.getCommentByIdOrThrow(commentId); 

        Optional<Like> existingLike = likeRepository.findByUserAndComment(user, comment); 
        if (existingLike.isPresent()) {
            return existingLike.get(); 
        }

        Like like = Like.builder()
                .user(user)
                .post(null)
                .comment(comment)
                .build();
        return likeRepository.save(like);
    }

    @Transactional // Add Transactional for delete operation
    public void unlikePost(String userEmail, Long postId) {
        User user = userService.getUserByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postService.getPostByIdOrThrow(postId);

        // Find the specific like by user and post
        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);

        // If the like exists, delete it
        existingLike.ifPresent(like -> likeRepository.delete(like));
        // No return value needed as the controller will fetch the updated post
    }

    @Transactional
    public void unlikeComment(String userEmail, Long commentId) {
        User user = userService.getUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Comment comment = commentService.getCommentByIdOrThrow(commentId);

        // Find the specific like by user and comment
        Optional<Like> existingLike = likeRepository.findByUserAndComment(user, comment);

        // If the like exists, delete it
        existingLike.ifPresent(likeRepository::delete);
    }

    public Optional<Like> getLikeById(Long id) {
        return likeRepository.findById(id);
    }

    public Long countLikesByPostId(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    public Long countLikesByCommentId(Long commentId) {
        return likeRepository.countByCommentId(commentId);
    }

    @Transactional(readOnly = true) 
    public List<User> getUsersWhoLikedComment(Long commentId) {

        List<Like> likes = likeRepository.findByCommentId(commentId);

        List<User> users = likes.stream()         
                            .map(Like::getUser) 
                            .distinct()        
                            .collect(Collectors.toList());

        return users;
    }
    @Transactional(readOnly = true)
    public List<User> getUsersWhoLikedPost(Long postId) {
        List<Like> likes = likeRepository.findByPostId(postId);
        List<User> users = likes.stream()
                            .map(Like::getUser)
                            .distinct()
                            .collect(Collectors.toList());
        return users;
    }
}
