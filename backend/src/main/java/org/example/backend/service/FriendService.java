package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Friend;
import org.example.backend.entity.User;
import org.example.backend.repository.FriendRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    @Transactional
    public Friend addFriend(Long userId1, Long userId2) {
        // Kiểm tra xem hai người dùng có tồn tại không
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId1));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId2));

        // Kiểm tra xem họ đã là bạn bè chưa
        if (friendRepository.areFriends(userId1, userId2)) {
            throw new RuntimeException("Users are already friends");
        }

        // Tạo mối quan hệ bạn bè
        Friend friend = new Friend();
        friend.setUser(user1);
        friend.setFriend(user2);
        return friendRepository.save(friend);
    }

    @Transactional
    public void removeFriend(Long userId1, Long userId2) {
        // Kiểm tra xem hai người dùng có tồn tại không
        if (!userRepository.existsById(userId1) || !userRepository.existsById(userId2)) {
            throw new RuntimeException("One or both users not found");
        }

        // Xóa mối quan hệ bạn bè
        friendRepository.deleteFriendship(userId1, userId2);
    }

    public List<Friend> getAllFriends(Long userId) {
        return friendRepository.findAllFriends(userId);
    }

    public boolean areFriends(Long userId1, Long userId2) {
        return friendRepository.areFriends(userId1, userId2);
    }
}