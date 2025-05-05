package org.example.backend.mapper;

import org.example.backend.dto.PostDTO;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.LikeRepository;
import org.example.backend.repository.CommentRepository;
import java.util.Collections;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import org.example.backend.elasticsearch.document.PostDocument;

@Component
@RequiredArgsConstructor
public class PostMapper {
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public PostDTO toDto(Post post, User currentUser) {
        if (post == null) {
            return null;
        }

        boolean likedByCurrentUser = false;
        if (currentUser != null) {
            likedByCurrentUser = likeRepository.findByUserAndPost(currentUser, post).isPresent();
        }
        long likesCount = likeRepository.countByPostId(post.getId());
        long commentsCount = commentRepository.countByPostId(post.getId());

        // Xử lý originalPost bị xóa
        PostDTO originalPostDto = null;
        if (post.getOriginalPost() != null) {
            Post originalPost = post.getOriginalPost();
            if (originalPost.isDeleted()) {
                // Nếu bài gốc đã xóa, chỉ giữ lại thông tin cơ bản
                originalPostDto = PostDTO.builder()
                        .id(originalPost.getId())
                        .user(originalPost.getUser())
                        .isDeleted(true)
                        .createdAt(originalPost.getCreatedAt())
                        .build();
            } else {
                originalPostDto = toDto(originalPost, currentUser);
            }
        }

        return PostDTO.builder()
                .id(post.getId())
                .content(post.getContent())
                .user(post.getUser())
                .images(post.getImages() != null ? post.getImages() : Collections.emptyList())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .likesCount(likesCount)
                .liked(likedByCurrentUser)
                .commentsCount(commentsCount)
                .originalPost(originalPostDto)
                .isDeleted(post.isDeleted())
                .build();
    }

    public PostDocument toDocument(Post post) {
        PostDocument postDocument = new PostDocument();
        postDocument.setId(post.getId().toString());
        postDocument.setContent(post.getContent());
        postDocument.setUserId(post.getUser().getId().toString());
        postDocument.setCreatedAt(post.getCreatedAt());
        postDocument.setUpdatedAt(post.getUpdatedAt() != null ? post.getUpdatedAt() : null);
        postDocument.setOriginalPostId(post.getOriginalPost() != null ? post.getOriginalPost().getId().toString() : null);
        postDocument.setIsDeleted(post.isDeleted());
        postDocument.setLikedByCurrentUser(post.isLikedByCurrentUser());
        postDocument.setLikeCount(post.getLikeCount());
        postDocument.setTotalCommentCount(post.getTotalCommentCount());
        return postDocument;
    }
}
