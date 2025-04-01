package org.example.backend.repository;

import org.example.backend.entity.Image;
import org.example.backend.entity.Post;
import org.example.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Add Repository annotation

import java.util.List;

@Repository // Add Repository annotation
public interface ImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByPost(Post post);
    List<Image> findByComment(Comment comment);

    // Find images by a list of URLs
    List<Image> findByUrlIn(List<String> urls);
}
