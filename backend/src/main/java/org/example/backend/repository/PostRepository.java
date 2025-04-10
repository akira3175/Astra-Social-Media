package org.example.backend.repository;

import org.example.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);
    List<Post> findByOriginalPostId(Long originalPostId);
    // Xóa các repost khi xóa bài gốc
    void deleteByOriginalPostId(Long originalPostId);
    List<Post> findByIsDeletedFalse();
    Optional<Post> findByIdAndIsDeletedFalse(Long id);
    List<Post> findByUserIdAndIsDeletedFalse(Long userId);
}