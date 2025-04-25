package org.example.backend.repository;

import org.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Page<User> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName, String lastName, Pageable pageable
    );
    @Query("SELECT u FROM User u " +
            "WHERE (:keyword IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:isStaff IS NULL OR u.isStaff = :isStaff) " +
            "AND (:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> searchUsers(@Param("keyword") String keyword,
                           @Param("isStaff") Boolean isStaff,
                           @Param("isActive") Boolean isActive,
                           Pageable pageable);

    List<User> findFriendsById(Long id);

    List<User> findTop6ByOrderByMutualFriendsDesc();

    @Query("SELECT COUNT(u) FROM User u")
    Long countAll();

    Long countByIsActiveFalse();
}