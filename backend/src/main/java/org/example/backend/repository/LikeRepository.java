package org.example.backend.repository;

import org.example.backend.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.backend.entity.Comment;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndComment(User user, Comment comment);
    Optional<Like> findByUserAndPost(User user, Post post);
    Long countByCommentId(Long commentId);
    Long countByPostId(Long postId);
    List<Like> findByCommentId(Long commentId);
    List<Like> findByPostId(Long postId);
}
