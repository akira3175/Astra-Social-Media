package org.example.backend.controller;

import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.FriendshipRepository;
import org.example.backend.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendFriendRequest(@RequestBody Map<String, String> request) {
        try {
            System.out.println("Received friend request: " + request);

            // Lấy thông tin người dùng hiện tại
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            // Lấy email người nhận từ request
            String receiverEmail = request.get("receiverEmail");
            if (receiverEmail == null) {
                System.out.println("Missing receiverEmail");
                return ResponseEntity.badRequest().body("Thiếu thông tin người nhận");
            }

            // Tìm người nhận
            User receiver = userRepository.findByEmail(receiverEmail)
                    .orElseThrow(() -> {
                        System.out.println("Receiver not found: " + receiverEmail);
                        return new RuntimeException("Người nhận không tồn tại");
                    });

            System.out.println("Found users - Sender: " + currentUserEmail + " (ID: " + currentUser.getId() +
                    "), Receiver: " + receiverEmail + " (ID: " + receiver.getId() + ")");

            // Gửi lời mời kết bạn
            Friendship friendship = friendshipService.sendFriendRequest(currentUser.getId(), receiver.getId());
            return ResponseEntity.ok(friendship);
        } catch (RuntimeException e) {
            System.err.println("Error in sendFriendRequest: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error in sendFriendRequest: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi gửi lời mời kết bạn: " + e.getMessage());
        }
    }

    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<Friendship> acceptFriendRequest(@PathVariable Long friendshipId) {
        System.out.println("Received accept friend request for friendshipId: " + friendshipId);
        Friendship friendship = friendshipService.acceptFriendRequest(friendshipId);
        System.out.println("Updated friendship: " + friendship);
        return ResponseEntity.ok(friendship);
    }

    @PostMapping("/reject/{friendshipId}")
    public ResponseEntity<Friendship> rejectFriendRequest(@PathVariable Long friendshipId) {
        System.out.println("Received reject friend request for friendshipId: " + friendshipId);
        Friendship friendship = friendshipService.rejectFriendRequest(friendshipId);
        System.out.println("Updated friendship: " + friendship);
        return ResponseEntity.ok(friendship);
    }

    @GetMapping("/pending/{userId}")
    public ResponseEntity<List<Friendship>> getPendingFriendRequests(@PathVariable Long userId) {
        List<Friendship> pendingRequests = friendshipService.getPendingFriendRequests(userId);
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/requests/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getFriendRequests(@PathVariable Long userId) {
        List<Friendship> pendingRequests = friendshipService.getPendingFriendRequests(userId);
        List<Map<String, Object>> requests = pendingRequests.stream()
                .map(friendship -> {
                    Map<String, Object> request = new HashMap<>();
                    request.put("id", friendship.getId());
                    request.put("sender", friendship.getUser1());
                    request.put("receiver", friendship.getUser2());
                    request.put("status", friendship.getStatus());
                    request.put("createdAt", friendship.getCreatedAt());
                    return request;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Friendship>> getFriends(@PathVariable Long userId) {
        List<Friendship> friends = friendshipService.getFriends(userId);
        return ResponseEntity.ok(friends);
    }

    @PutMapping("/{friendshipId}/active")
    public ResponseEntity<Friendship> updateFriendshipActive(@PathVariable Long friendshipId,
            @RequestParam boolean active) {
        Friendship friendship = friendshipService.updateFriendshipActive(friendshipId, active);
        return ResponseEntity.ok(friendship);
    }

    @GetMapping("/sent/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getSentFriendRequests(@PathVariable Long userId) {
        try {
            // Kiểm tra xem userId có phải là người dùng hiện tại không
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = authentication.getName();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));

            if (!currentUser.getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(List.of());
            }

            List<Friendship> sentRequests = friendshipService.getSentFriendRequests(userId);
            List<Map<String, Object>> requests = sentRequests.stream()
                    .map(friendship -> {
                        Map<String, Object> request = new HashMap<>();
                        request.put("id", friendship.getId());
                        request.put("receiver", friendship.getUser2());
                        request.put("status", friendship.getStatus());
                        request.put("createdAt", friendship.getCreatedAt());
                        return request;
                    })
                    .collect(Collectors.toList());
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }
}