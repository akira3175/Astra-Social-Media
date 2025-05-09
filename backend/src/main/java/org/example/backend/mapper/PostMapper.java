package org.example.backend.mapper;

import org.example.backend.dto.PostDTO;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.LikeRepository;
import org.example.backend.repository.CommentRepository;
import org.example.backend.repository.PostRepository;
import java.util.Collections;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import org.example.backend.elasticsearch.document.PostDocument;


@Component
@RequiredArgsConstructor
public class PostMapper {
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
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

    public PostDTO toDTO(PostDocument postDocument, User user) {
        if (postDocument == null) {
            return null;
        }

        boolean likedByCurrentUser = false;
        if (user != null) {
            Post post = postRepository.findById(Long.parseLong(postDocument.getId()))
                    .orElse(null);
            likedByCurrentUser = likeRepository.findByUserAndPost(user, post).isPresent();
        }

        long likesCount = likeRepository.countByPostId(Long.parseLong(postDocument.getId()));
        long commentsCount = commentRepository.countByPostId(Long.parseLong(postDocument.getId()));

        PostDTO originalPostDto = null;
        if (postDocument.getOriginalPostId() != null) {
            Post originalPost = postRepository.findById(Long.parseLong(postDocument.getOriginalPostId()))
                    .orElse(null);
            originalPostDto = toDto(originalPost, user);
        }

        return PostDTO.builder()
                .id(Long.parseLong(postDocument.getId()))
                .content(postDocument.getContent())
                .user(user)
                .createdAt(postDocument.getCreatedAt())
                .updatedAt(postDocument.getUpdatedAt() != null ? postDocument.getUpdatedAt() : null)
                .originalPost(originalPostDto)
                .isDeleted(postDocument.isDeleted())
                .liked(likedByCurrentUser)
                .likesCount(likesCount)
                .commentsCount(commentsCount)
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
