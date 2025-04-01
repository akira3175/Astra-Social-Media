package org.example.backend.service;

import org.example.backend.entity.Like;
import org.example.backend.repository.LikeRepository;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

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



    public Optional<Like> getLikeById(Long id) {
        return likeRepository.findById(id);
    }

    public Like getLikeByUserIdAndPostId(long userId, long postId) {
        return likeRepository.findByUserIdAndPostId(userId, postId);
    }

    public Like getLikeByUserIdAndCommentId(long userId, long commentId) {
        return likeRepository.findByUserIdAndCommentId(userId, commentId);
    }

    public void deleteLikeByUserIdAndPostId(long userId, long postId) {
        likeRepository.deleteByUserIdAndPostId(userId, postId);
    }

    public void deleteLikeByUserIdAndCommentId(long userId, long commentId) {
        likeRepository.deleteByUserIdAndCommentId(userId, commentId);
    }

    public Long countLikesByPostId(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    public Long countLikesByCommentId(Long commentId) {
        return likeRepository.countByCommentId(commentId);
    }
}
