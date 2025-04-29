package org.example.backend.service;

import jakarta.persistence.EntityNotFoundException;
import org.example.backend.entity.ChatMessage;
import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.example.backend.exception.FriendshipException;
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

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Friendship createFriendRequest(String senderEmail, String receiverEmail) {
        // Get users by email
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người gửi không tồn tại"));

        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người nhận không tồn tại"));

        notificationService.notifyFriendRequest(sender, receiver);
        return createFriendRequestById(sender, receiver);
    }

    @Transactional
    public Friendship createFriendRequestById(User sender, User receiver) {
        // Check if friendship already exists
        if (friendshipRepository.existsBetweenUsers(sender, receiver)) {
            throw new FriendshipException("Đã tồn tại mối quan hệ bạn bè hoặc lời mời kết bạn");
        }

        // Create and save friendship
        Friendship friendship = new Friendship();
        friendship.setUser1(sender);
        friendship.setUser2(receiver);
        friendship.setStatus(ChatMessage.FriendshipStatus.PENDING);

        return friendshipRepository.save(friendship);
    }

    @Transactional
    public void cancelFriendRequest(String senderEmail, String receiverEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người gửi"));

        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người nhận"));

        Friendship friendship = friendshipRepository.findByUser1AndUser2(sender, receiver)
                .orElseThrow(() -> new FriendshipException("Không tìm thấy lời mời kết bạn"));

        notificationService.deleteFriendRequestNotification(receiver, sender);
        friendshipRepository.delete(friendship);
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