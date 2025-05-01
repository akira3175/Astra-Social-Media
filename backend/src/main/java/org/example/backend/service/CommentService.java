package org.example.backend.service;

import org.example.backend.dto.CommentDTO;
import org.example.backend.dto.CommentListResponse;
import org.example.backend.entity.*;
import org.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Date;

@Service
public class CommentService {

    private static final long EDIT_TIME_LIMIT_MINUTES = 30;

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
    private NotificationService notificationService;

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
        }

        if (images != null && !images.isEmpty()) {
            for (Image image : images) {
                image.setComment(comment);
            }
            comment.setImages(images);
        }

        comment = commentRepository.save(comment);

        // ✳️ Gửi thông báo sau khi lưu
        notificationService.notifyComment(comment);

        return comment;
    }

    @Transactional
    public Comment updateComment(Long id, String email, String newContent) {
        // Kiểm tra input
        if (id == null || email == null || newContent == null) {
            throw new IllegalArgumentException("Invalid input parameters");
        }

        Comment existingComment = commentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User currentUser = getCurrentUser(email);
        
        // Kiểm tra quyền sửa comment
        if (!existingComment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to update this comment");
        }

        // Chỉ kiểm tra thời gian khi comment đã được sửa trước đó
        if (existingComment.getUpdatedAt() != null) {
            long currentTime = System.currentTimeMillis();
            long lastEditTime = existingComment.getUpdatedAt().getTime();
            long timeDifferenceMinutes = (currentTime - lastEditTime) / (60 * 1000);

            if (timeDifferenceMinutes < EDIT_TIME_LIMIT_MINUTES) {
                throw new RuntimeException(
                    String.format("Phải đợi %d phút sau lần sửa trước để có thể sửa lại", 
                    EDIT_TIME_LIMIT_MINUTES)
                );
            }
        }

        existingComment.setContent(newContent.trim());
        existingComment.setUpdatedAt(new Date());
        return commentRepository.save(existingComment);
    }

    @Transactional
    public void softDeleteComment(Long id, String email) {
        Comment comment = commentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User currentUser = getCurrentUser(email);
        
        // Kiểm tra quyền xóa comment
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to delete this comment");
        }

        // Thực hiện xóa mềm
        comment.setDeleted(true);
        comment.setDeletedAt(new Date());
        commentRepository.save(comment);
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
                .map(Like::getUser)
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

    public Long countAllComments() {
        return commentRepository.countAll();
    }
}
