package org.example.backend.service;

import org.example.backend.dto.CommentDTO;
import org.example.backend.dto.CommentListResponse;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Image;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.ImageRepository;
import org.example.backend.repository.LikeRepository;
import org.example.backend.repository.PostRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    
        // Gán comment cha nếu có
        if (parentCommentId != null) {
            Comment parent = getCommentByIdOrThrow(parentCommentId);
            comment.setParentComment(parent);
        }
    
        // Gán ảnh nếu có
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
