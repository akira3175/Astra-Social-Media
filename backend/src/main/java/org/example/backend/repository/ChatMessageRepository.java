package org.example.backend.repository;

import org.example.backend.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for {@link ChatMessage} entities.
 * Provides methods for querying chat messages.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

        /**
         * Finds all messages between two users ordered by timestamp descending.
         *
         * @param sender1 First user ID
         * @param receiver1 Second user ID
         * @param sender2 First user ID (reversed order)
         * @param receiver2 Second user ID (reversed order)
         * @param pageable Pagination and sorting information
         * @return List of messages between the two users
         */
        @Query("SELECT m FROM ChatMessage m WHERE " +
                "(m.sender.id = :user1 AND m.receiver.id = :user2) OR " +
                "(m.sender.id = :user2 AND m.receiver.id = :user1) " +
                "ORDER BY m.timestamp DESC")
        List<ChatMessage> findMessagesBetweenUsers(
                @Param("user1") String user1,
                @Param("user2") String user2,
                Pageable pageable);
 

        /**
         * Finds all messages where the user is either sender or receiver.
         *
         * @param userId The user ID
         * @return List of messages where the user is involved
         */
        @Query("SELECT m FROM ChatMessage m WHERE " +
                "m.sender.id = :userId OR m.receiver.id = :userId " +
                "ORDER BY m.timestamp DESC")
        List<ChatMessage> findBySenderIdOrReceiverIdOrderByTimestampDesc(@Param("userId") String userId);

        /**
         * Counts all messages in the system.
         *
         * @return The total count of messages
         */
        @Query("SELECT COUNT(c) FROM ChatMessage c")
        long countAllMessages();

        /**
         * Counts unread messages for a specific receiver.
         *
         * @param receiverId The receiver's ID
         * @return Count of unread messages
         */
        @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.receiver.id = :receiverId AND c.isRead = false")
        int countByReceiverIdAndIsReadFalse(@Param("receiverId") String receiverId);

        /**
         * Counts unread messages from a specific sender to a specific receiver.
         *
         * @param receiverId The receiver's ID
         * @param senderId The sender's ID
         * @return Count of unread messages
         */
        @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.receiver.id = :receiverId AND c.sender.id = :senderId AND c.isRead = false")
        int countByReceiverIdAndSenderIdAndIsReadFalse(@Param("receiverId") String receiverId, @Param("senderId") String senderId);

        /**
         * Finds all unread messages from a specific sender to a specific receiver.
         *
         * @param receiverId The receiver's ID
         * @param senderId The sender's ID
         * @return List of unread messages
         */
        @Query("SELECT c FROM ChatMessage c WHERE c.receiver.id = :receiverId AND c.sender.id = :senderId AND c.isRead = false")
        List<ChatMessage> findByReceiverIdAndSenderIdAndIsReadFalse(@Param("receiverId") String receiverId, @Param("senderId") String senderId);
}