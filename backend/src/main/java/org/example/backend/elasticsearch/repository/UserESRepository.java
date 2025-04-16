package org.example.backend.elasticsearch.repository;

import org.example.backend.elasticsearch.document.UserDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface UserESRepository extends ElasticsearchRepository<UserDocument, String> {

    List<UserDocument> findByFullNameContainingIgnoreCase(String keyword);
    Page<UserDocument> findByFullNameContainingIgnoreCaseAndIsStaffAndIsActive(
            String fullName,
            Boolean isStaff,
            Boolean isActive,
            Pageable pageable
    );

}
