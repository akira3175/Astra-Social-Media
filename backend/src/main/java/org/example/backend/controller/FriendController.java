package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Friend;
import org.example.backend.entity.User;
import org.example.backend.entity.Friendship;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.FriendshipRepository;
import org.example.backend.service.FriendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friendships")
@RequiredArgsConstructor
public class FriendController {
    private final FriendService friendService;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Friend>> getFriends(@PathVariable Long userId) {
        List<Friend> friends = friendService.getAllFriends(userId);
        return ResponseEntity.ok(friends);
    }

    @PostMapping("/{userId1}/{userId2}")
    public ResponseEntity<Friend> addFriend(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        Friend friend = friendService.addFriend(userId1, userId2);
        return ResponseEntity.ok(friend);
    }

    @DeleteMapping("/{userId1}/{userId2}")
    public ResponseEntity<Void> removeFriend(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        friendService.removeFriend(userId1, userId2);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/{userId1}/{userId2}")
    public ResponseEntity<Boolean> areFriends(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        boolean areFriends = friendService.areFriends(userId1, userId2);
        return ResponseEntity.ok(areFriends);
    }

    @GetMapping("/suggestions/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getSuggestedUsers(@PathVariable Long userId) {
        try {
            // Kiểm tra xem userId có phải là người dùng hiện tại không
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            if (!currentUser.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Bạn không có quyền truy cập danh sách gợi ý của người dùng khác");
            }

            // 1. Lấy danh sách tất cả người dùng
            List<User> allUsers = userRepository.findAll();

            // 2. Lấy danh sách bạn bè của người dùng hiện tại
            List<Friend> friends = friendService.getAllFriends(userId);
            Set<Long> friendIds = friends.stream()
                    .map(friend -> friend.getFriend().getId())
                    .collect(Collectors.toSet());

            // 3. Lấy danh sách lời mời kết bạn đã gửi
            List<Friendship> sentRequests = friendshipRepository.findByUser1Id(userId);
            Set<Long> sentRequestIds = sentRequests.stream()
                    .map(request -> request.getUser2().getId())
                    .collect(Collectors.toSet());

            // 4. Lấy danh sách lời mời kết bạn đã nhận
            List<Friendship> receivedRequests = friendshipRepository.findByUser2Id(userId);
            Set<Long> receivedRequestIds = receivedRequests.stream()
                    .map(request -> request.getUser1().getId())
                    .collect(Collectors.toSet());

            // 5. Lọc và trả về danh sách gợi ý
            List<Map<String, Object>> suggestedUsers = allUsers.stream()
                    .filter(user -> !user.getId().equals(userId)) // Loại trừ người dùng hiện tại
                    .filter(user -> !friendIds.contains(user.getId())) // Loại trừ bạn bè
                    .filter(user -> !sentRequestIds.contains(user.getId())) // Loại trừ người đã gửi lời mời
                    .filter(user -> !receivedRequestIds.contains(user.getId())) // Loại trừ người đã nhận lời mời
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("firstName", user.getFirstName());
                        userMap.put("lastName", user.getLastName());
                        userMap.put("email", user.getEmail());
                        userMap.put("avatar", user.getAvatar());

                        // Tính số bạn chung
                        List<Friend> userFriends = friendService.getAllFriends(user.getId());
                        Set<Long> userFriendIds = userFriends.stream()
                                .map(friend -> friend.getFriend().getId())
                                .collect(Collectors.toSet());

                        long mutualFriends = userFriendIds.stream()
                                .filter(friendIds::contains)
                                .count();

                        userMap.put("mutualFriends", mutualFriends);
                        return userMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(suggestedUsers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách gợi ý kết bạn: " + e.getMessage());
        }
    }
}