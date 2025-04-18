package org.example.backend.service;

import org.example.backend.entity.*;
import org.example.backend.repository.LikeRepository;
import org.example.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserService userService; 
    @Autowired
    private PostService postService; 
    @Autowired
    private CommentService commentService;
    @Autowired NotificationService notificationService;


    public void deleteLike(Long id) {
        likeRepository.deleteById(id);
    }

    @Transactional
    public Like likePost(String userEmail, Long postId) {
        User user = userService.getUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

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

        like = likeRepository.save(like);

        // ✅ Tạo thông báo
        Notification notification = Notification.builder()
                .senderId(user.getId())
                .receiverId(post.getUser().getId())
                .type(NotificationType.LIKE)
                .postId(postId)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // ✅ Gửi thông báo qua WebSocket
        String receiverEmail = post.getUser().getEmail(); // Giả sử User có field email
        notificationService.sendToUser(receiverEmail, notification);

        return like;
    }


    @Transactional
    public Like likeComment(String userEmail, Long commentId) {
        User user = userService.getUserByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
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

        // Tạo thông báo nếu không phải like chính mình
        if (!user.getId().equals(comment.getUser().getId())) {
            Notification notification = Notification.builder()
                    .senderId(user.getId())
                    .receiverId(comment.getUser().getId())
                    .type(NotificationType.COMMENT_LIKE)
                    .postId(comment.getPost().getId())
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
        }

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
