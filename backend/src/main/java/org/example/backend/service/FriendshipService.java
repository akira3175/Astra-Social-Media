package org.example.backend.service;

import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.example.backend.repository.FriendshipRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FriendshipService {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public void sendFriendRequest(Long senderId, Long receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Optional<Friendship> existingFriendship = friendshipRepository.findFriendship(sender, receiver);
        if (existingFriendship.isPresent()) {
            throw new RuntimeException("Friendship request already exists");
        }

        Friendship friendship = new Friendship();
        friendship.setUser1(sender);
        friendship.setUser2(receiver);
        friendship.setStatus("PENDING");
        friendshipRepository.save(friendship);

        // Gửi thông báo
        notificationService.sendFriendRequestNotification(sender, receiver);
    }

    public void acceptFriendRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (!friendship.getUser2().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to accept this request");
        }

        friendship.setStatus("ACCEPTED");
        friendshipRepository.save(friendship);

        // Gửi thông báo
        notificationService.sendFriendRequestAcceptedNotification(friendship.getUser2(), friendship.getUser1());
    }

    public void rejectFriendRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (!friendship.getUser2().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to reject this request");
        }

        friendship.setStatus("REJECTED");
        friendshipRepository.save(friendship);
    }

    public List<User> getPendingFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return friendshipRepository.findPendingFriendRequests(user)
                .stream()
                .map(Friendship::getUser1)
                .collect(Collectors.toList());
    }

    public List<User> getFriendSuggestions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("Getting suggestions for user: " + user.getId());

        List<User> friends = friendshipRepository.findAllFriendships(user)
                .stream()
                .map(f -> f.getUser1().getId().equals(userId) ? f.getUser2() : f.getUser1())
                .collect(Collectors.toList());

        System.out.println("Current friends: " + friends.size());

        // Lấy tất cả user trừ bản thân và bạn bè hiện tại
        List<User> suggestions = userRepository.findAll()
                .stream()
                .filter(u -> !u.getId().equals(userId) && !friends.contains(u))
                .collect(Collectors.toList());

        System.out.println("Found suggestions: " + suggestions.size());
        return suggestions;
    }
}