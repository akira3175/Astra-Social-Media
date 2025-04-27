package org.example.backend.service;

import org.example.backend.entity.ChatMessage;
import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.example.backend.repository.FriendshipRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FriendshipService {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Friendship sendFriendRequest(Long senderId, Long receiverId) {
        System.out.println("Processing friend request between users with IDs " + senderId + " and " + receiverId);

        User user1 = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found with ID: " + senderId));
        User user2 = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found with ID: " + receiverId));

        System.out.println("Found users: " + user1.getFirstName() + " and " + user2.getFirstName());

        // Kiểm tra xem đã có friendship nào chưa (theo cả hai chiều)
        if (friendshipRepository.existsBetweenUsers(user1, user2)) {
            System.out.println(
                    "Friendship already exists between " + user1.getFirstName() + " and " + user2.getFirstName());
            throw new RuntimeException("Friendship already exists");
        }

        Friendship friendship = new Friendship();
        friendship.setUser1(user1);
        friendship.setUser2(user2);
        friendship.setStatus(ChatMessage.FriendshipStatus.PENDING);

        Friendship savedFriendship = friendshipRepository.save(friendship);
        System.out.println("Saved friendship: " + savedFriendship);
        return savedFriendship;
    }

    @Transactional
    public Friendship acceptFriendRequest(Long friendshipId) {
        System.out.println("Finding friendship with ID: " + friendshipId);
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));
        System.out.println("Found friendship: " + friendship);
        System.out.println("Current status: " + friendship.getStatus());
        friendship.setStatus(ChatMessage.FriendshipStatus.ACCEPTED);
        friendship.setActive(true);
        Friendship savedFriendship = friendshipRepository.save(friendship);
        System.out.println("Saved friendship with new status: " + savedFriendship.getStatus());
        return savedFriendship;
    }

    @Transactional
    public Friendship rejectFriendRequest(Long friendshipId) {
        System.out.println("Finding friendship with ID: " + friendshipId);
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));
        System.out.println("Found friendship: " + friendship);
        System.out.println("Current status: " + friendship.getStatus());
        friendship.setStatus(ChatMessage.FriendshipStatus.REJECTED);
        friendship.setActive(false);
        Friendship savedFriendship = friendshipRepository.save(friendship);
        System.out.println("Saved friendship with new status: " + savedFriendship.getStatus());
        return savedFriendship;
    }

    public List<Friendship> getPendingFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendshipRepository.findByUser2AndStatus(user, ChatMessage.FriendshipStatus.PENDING);
    }

    public List<Friendship> getFriends(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendshipRepository.findByUser1OrUser2AndStatus(user, user, ChatMessage.FriendshipStatus.ACCEPTED);
    }

    @Transactional
    public Friendship updateFriendshipActive(Long friendshipId, boolean active) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));
        friendship.setActive(active);
        return friendshipRepository.save(friendship);
    }

    public List<Friendship> getSentFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendshipRepository.findByUser1AndStatus(user, ChatMessage.FriendshipStatus.PENDING);
    }
}