package org.example.backend.controller;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.example.backend.exception.FriendshipException;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.FriendshipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friendships")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;
    private final UserRepository userRepository;

    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> sendFriendRequest(@RequestBody Map<String, String> request) {
        try {
            // Validate receiver email
            String receiverEmail = request.get("receiverEmail");
            if (receiverEmail == null || receiverEmail.isEmpty()) {
                return ResponseEntity.badRequest().body("Thiếu thông tin email người nhận");
            }

            String currentUserEmail = getCurrentUserEmail();

            // Prevent self-friending
            if (currentUserEmail.equals(receiverEmail)) {
                return ResponseEntity.badRequest().body("Không thể gửi lời mời kết bạn cho chính mình");
            }

            // Create friendship request
            Friendship friendship = friendshipService.createFriendRequest(currentUserEmail, receiverEmail);
            return ResponseEntity.ok(friendship);

        } catch (EntityNotFoundException | FriendshipException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi gửi lời mời kết bạn: " + e.getMessage());
        }
    }

    @DeleteMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelFriendRequest(@RequestBody Map<String, String> request) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            friendshipService.cancelFriendRequest(currentUserEmail, request.get("receiverEmail"));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<Friendship> acceptFriendRequest(@PathVariable Long friendshipId) {
        try {
            Friendship friendship = friendshipService.acceptFriendRequest(friendshipId);
            return ResponseEntity.ok(friendship);
        } catch (FriendshipException e) {
            System.out.println("Friendship not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            System.out.println("Error accepting friend request: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }


    @PostMapping("/reject/{friendshipId}")
    public ResponseEntity<Friendship> rejectFriendRequest(@PathVariable Long friendshipId) {
        try {
            Friendship friendship = friendshipService.rejectFriendRequest(friendshipId);
            return ResponseEntity.ok(friendship);
        } catch (Exception e) {
            System.out.println("Error rejecting friend request: " + e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/pending/{userId}")
    public ResponseEntity<List<Friendship>> getPendingFriendRequests(@PathVariable Long userId) {
        List<Friendship> pendingRequests = friendshipService.getPendingFriendRequests(userId);
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/requests/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getFriendRequests(@PathVariable Long userId) {
        List<Friendship> pendingRequests = friendshipService.getPendingFriendRequests(userId);
        List<Map<String, Object>> requests = mapFriendshipToRequestMap(pendingRequests);
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
            if (!isValidUserRequest(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(List.of());
            }

            List<Friendship> sentRequests = friendshipService.getSentFriendRequests(userId);
            List<Map<String, Object>> requests = mapFriendshipToRequestMap(sentRequests);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    // Helper methods to improve readability
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private boolean isValidUserRequest(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        return currentUser.getId().equals(userId);
    }

    private List<Map<String, Object>> mapFriendshipToRequestMap(List<Friendship> friendships) {
        return friendships.stream()
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
    }
}
