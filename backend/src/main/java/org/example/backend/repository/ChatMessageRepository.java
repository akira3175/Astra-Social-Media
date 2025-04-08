package org.example.backend.repository;

import org.example.backend.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    @Query("SELECT m FROM ChatMessage m WHERE (m.senderId = ?1 AND m.receiverId = ?2) OR (m.senderId = ?2 AND m.receiverId = ?1) ORDER BY m.timestamp DESC")
    List<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByTimestampDesc(
            String senderId1, String receiverId1, String senderId2, String receiverId2,
            Pageable pageable);

    @Query("SELECT m FROM ChatMessage m WHERE m.senderId = ?1 OR m.receiverId = ?1 ORDER BY m.timestamp DESC")
    List<ChatMessage> findBySenderIdOrReceiverIdOrderByTimestampDesc(String userId);

    @Query("SELECT COUNT(c) FROM ChatMessage c")
    long countAllMessages();
}