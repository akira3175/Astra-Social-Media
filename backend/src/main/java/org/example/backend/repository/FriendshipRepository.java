package org.example.backend.repository;

import org.example.backend.entity.Friendship;
import org.example.backend.entity.Friendship.FriendshipStatus;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    // Find by requester and receiver
    Optional<Friendship> findByRequesterAndReceiver(User requester, User receiver);

    // Find by requester, receiver and status
    Optional<Friendship> findByRequesterAndReceiverAndStatus(User requester, User receiver, FriendshipStatus status);

    // Find all by status
    List<Friendship> findByStatus(FriendshipStatus status);

    // Find all by requester or receiver
    List<Friendship> findByRequesterIdOrReceiverId(Long requesterId, Long receiverId);

    // Find all by requester
    List<Friendship> findByRequesterId(Long requesterId);

    // Find all by receiver
    List<Friendship> findByReceiverId(Long receiverId);

    // Find all by requester and status
    List<Friendship> findByRequesterAndStatus(User requester, FriendshipStatus status);

    // Find all by receiver and status
    List<Friendship> findByReceiverAndStatus(User receiver, FriendshipStatus status);

    // Find all by requester, status and active
    List<Friendship> findByRequesterAndStatusAndActive(User requester, FriendshipStatus status, boolean active);

    // Find all by receiver, status and active
    List<Friendship> findByReceiverAndStatusAndActive(User receiver, FriendshipStatus status, boolean active);

    // Count by requester and status
    long countByRequesterAndStatus(User requester, FriendshipStatus status);

    // Count by receiver and status
    long countByReceiverAndStatus(User receiver, FriendshipStatus status);
}