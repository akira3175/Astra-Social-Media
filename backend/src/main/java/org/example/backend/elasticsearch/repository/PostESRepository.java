package org.example.backend.elasticsearch.repository;

import org.example.backend.elasticsearch.document.PostDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface PostESRepository extends ElasticsearchRepository<PostDocument, String> {
    Page<PostDocument> findByContentContainingAndIsDeletedFalse(String keyword, Pageable pageable);
    Page<PostDocument> findByContentContaining(String keyword, Pageable pageable);
}
