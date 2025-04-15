package org.example.backend.repository;

import org.example.backend.entity.ChatMessage;
import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    Optional<Friendship> findByUser1AndUser2(User user1, User user2);

    List<Friendship> findByUser1AndStatus(User user1, ChatMessage.FriendshipStatus status);

    List<Friendship> findByUser2AndStatus(User user2, ChatMessage.FriendshipStatus status);

    List<Friendship> findByUser1OrUser2AndStatus(User user1, User user2, ChatMessage.FriendshipStatus status);

    boolean existsByUser1AndUser2(User user1, User user2);
}