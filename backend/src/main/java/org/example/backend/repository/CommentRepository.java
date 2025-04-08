package org.example.backend.repository;

import org.example.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Remove or modify this method as it's fetching all comments
    // List<Comment> findByPostId(Long postId);
    
    @Query(value = "SELECT COUNT(*) FROM comments WHERE post_id = :postId", nativeQuery = true)
    Long countByPostId(Long postId);
    
    List<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(Long postId);
}
