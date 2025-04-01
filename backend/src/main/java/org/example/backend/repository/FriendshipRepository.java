package org.example.backend.repository;

import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    @Query("SELECT f FROM Friendship f WHERE (f.user1 = ?1 AND f.user2 = ?2) OR (f.user1 = ?2 AND f.user2 = ?1)")
    Optional<Friendship> findFriendship(User user1, User user2);

    @Query("SELECT f FROM Friendship f WHERE (f.user1 = ?1 OR f.user2 = ?1) AND f.status = 'ACCEPTED'")
    List<Friendship> findAllFriendships(User user);

    @Query("SELECT f FROM Friendship f WHERE f.user2 = ?1 AND f.status = 'PENDING'")
    List<Friendship> findPendingFriendRequests(User user);
}