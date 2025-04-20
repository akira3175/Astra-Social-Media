package org.example.backend.service;

import org.example.backend.dto.CommentDTO;
import org.example.backend.dto.CommentListResponse;
import org.example.backend.entity.*;
import org.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private LikeRepository likeRepository;  

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    public Optional<Comment> getCommentById(Long id) {
        return commentRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public CommentListResponse getCommentsAndCountByPostId(Long postId) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = getCurrentUser(currentUserEmail);
        
        List<Comment> rootComments = commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(postId);
        List<CommentDTO> rootCommentDtos = rootComments.stream()
                .map(comment -> convertToDto(comment, currentUser))
                .collect(Collectors.toList());

        long totalCount = commentRepository.countByPostId(postId);

        return CommentListResponse.builder()
                .comments(rootCommentDtos)
                .totalCount(totalCount)
                .build();
    }

    @Transactional
    public Comment createComment(Long postId, String email, String content, List<Image> images, Long parentCommentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .user(user)
                .build();

        if (parentCommentId != null) {
            Comment parent = getCommentByIdOrThrow(parentCommentId);
            comment.setParentComment(parent);

            // Gửi thông báo nếu người bình luận không phải chính chủ
            if (!parent.getUser().getId().equals(user.getId())) {
                Notification notification = Notification.builder()
                        .senderId(user.getId())
                        .receiverId(parent.getUser().getId())
                        .type(NotificationType.COMMENT_REPLY)
                        .postId(postId)
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(notification);
            }
        } else {
            // Comment gốc → gửi cho chủ bài viết
            if (!post.getUser().getId().equals(user.getId())) {
                Notification notification = Notification.builder()
                        .senderId(user.getId())
                        .receiverId(post.getUser().getId())
                        .type(NotificationType.COMMENT)
                        .postId(postId)
                        .build();
                notificationRepository.save(notification);
            }
        }

        if (images != null && !images.isEmpty()) {
            for (Image image : images) {
                image.setComment(comment);
            }
            comment.setImages(images);
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

    @Transactional(readOnly = true)
    public CommentDTO getCommentDtoById(Long commentId, String currentUserEmail) {
        Comment comment = getCommentByIdOrThrow(commentId);
        User currentUser = getCurrentUser(currentUserEmail);
        
        return convertToDto(comment, currentUser);
    }

    private CommentDTO convertToDto(Comment comment, User currentUser) {
        if (comment == null) {
            return null;
        }

        // Lấy thông tin like
        boolean likedByCurrentUser = likeRepository.findByUserAndComment(currentUser, comment).isPresent();
        long likesCount = likeRepository.countByCommentId(comment.getId());
        List<User> likedUsers = comment.getLikes().stream()
                .map(like -> like.getUser())
                .collect(Collectors.toList());

        // Đệ quy chuyển đổi replies thành DTOs
        List<CommentDTO> replyDtos = comment.getReplies().stream()
                .map(reply -> convertToDto(reply, currentUser))
                .collect(Collectors.toList());

        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(comment.getUser())
                .postId(comment.getPost().getId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .likes(likedUsers)
                .likeCount(likesCount)
                .isLiked(likedByCurrentUser)
                .parentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .replies(replyDtos)
                .images(comment.getImages())
                .build();
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Comment getCommentByIdOrThrow(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
    }

}
