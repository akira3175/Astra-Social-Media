package org.example.backend.repository;

import org.example.backend.entity.ChatMessage;
import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    
    Optional<Friendship> findById(Long id);

    Optional<Friendship> findByUser1AndUser2(User user1, User user2);

    List<Friendship> findByUser1AndStatus(User user1, ChatMessage.FriendshipStatus status);

    List<Friendship> findByUser2AndStatus(User user2, ChatMessage.FriendshipStatus status);

    List<Friendship> findByUser1OrUser2AndStatus(User user1, User user2, ChatMessage.FriendshipStatus status);

    boolean existsByUser1AndUser2(User user1, User user2);

    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f WHERE " +
            "(f.user1 = :user1 AND f.user2 = :user2) OR (f.user1 = :user2 AND f.user2 = :user1)")
    boolean existsBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

    // Tìm tất cả lời mời kết bạn mà user1 đã gửi
    List<Friendship> findByUser1Id(Long user1Id);

    // Tìm tất cả lời mời kết bạn mà user2 đã nhận
    List<Friendship> findByUser2Id(Long user2Id);
}