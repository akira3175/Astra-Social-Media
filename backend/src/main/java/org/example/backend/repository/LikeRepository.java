package org.example.backend.repository;

import org.example.backend.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.example.backend.entity.Comment;
import org.example.backend.entity.Like;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    Optional<Like> findByUserAndComment(User user, Comment comment);

    List<Like> findByPostId(Long postId);
    List<Like> findByCommentId(Long commentId);
    Like findByUserIdAndPostId(long userId, long postId);
    Like findByUserIdAndCommentId(long userId, long commentId);
    void deleteByUserIdAndPostId(long userId, long postId);
    void deleteByUserIdAndCommentId(long userId, long commentId);
    Long countByPostId(Long postId);
    Long countByCommentId(Long commentId);
}
