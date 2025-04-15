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
    public Friendship sendFriendRequest(Long userId1, Long userId2) {
        System.out.println("Processing friend request between users " + userId1 + " and " + userId2);

        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId1));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId2));

        System.out.println("Found users: " + user1.getFirstName() + " and " + user2.getFirstName());

// Kiểm tra xem đã có friendship nào chưa
        Optional<Friendship> existingFriendship = friendshipRepository.findByUser1AndUser2(user1, user2);
        if (existingFriendship.isPresent()) {
            System.out.println("Friendship already exists: " + existingFriendship.get());
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
}