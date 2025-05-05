package org.example.backend.controller;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.example.backend.exception.FriendshipException;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.FriendshipService;
import org.example.backend.util.ImageUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> acceptFriendRequest(@PathVariable Long friendshipId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            Friendship friendship = friendshipService.acceptFriendRequest(friendshipId, currentUserEmail);
            return ResponseEntity.ok(friendship);
        } catch (FriendshipException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi chấp nhận lời mời kết bạn: " + e.getMessage());
        }
    }

    @PostMapping("/reject/{friendshipId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> rejectFriendRequest(@PathVariable Long friendshipId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            Friendship friendship = friendshipService.rejectFriendRequest(friendshipId, currentUserEmail);
            return ResponseEntity.ok(friendship);
        } catch (FriendshipException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi từ chối lời mời kết bạn: " + e.getMessage());
        }
    }

    @PostMapping("/block/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> blockUser(@PathVariable Long userId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            Friendship friendship = friendshipService.blockUser(currentUserEmail, userId);
            return ResponseEntity.ok(friendship);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi chặn người dùng: " + e.getMessage());
        }
    }

    @PostMapping("/unblock/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> unblockUser(@PathVariable Long userId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            friendshipService.unblockUser(currentUserEmail, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi bỏ chặn người dùng: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPendingFriendRequests(HttpServletRequest request) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

            List<Friendship> pendingRequests = friendshipService.getPendingFriendRequests(currentUser.getId());

            List<Map<String, Object>> pendingRequestsMap = pendingRequests.stream()
                    .map(friendship -> mapFriendshipToResponse(friendship, request))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(pendingRequestsMap);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách lời mời kết bạn: " + e.getMessage());
        }
    }

    @GetMapping("/sent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getSentFriendRequests(HttpServletRequest request) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

            List<Map<String, Object>> sentRequests = friendshipService.getSentFriendRequests(currentUser.getId())
                    .stream()
                    .map(friendship -> mapSentFriendshipToResponse(friendship, request))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(sentRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách lời mời đã gửi: " + e.getMessage());
        }
    }

    @GetMapping("/friends")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFriends(HttpServletRequest request) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

            List<Map<String, Object>> friends = friendshipService.getFriends(currentUser.getId())
                    .stream()
                    .map(friendship -> mapFriendshipToResponse(friendship, request))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(friends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách bạn bè: " + e.getMessage());
        }
    }

    @GetMapping("/blocked")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getBlockedUsers(HttpServletRequest request) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

            List<Map<String, Object>> blockedUsers = friendshipService.getBlockedUsers(currentUser.getId())
                    .stream()
                    .map(friendship -> mapFriendshipToResponse(friendship, request))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(blockedUsers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách người dùng bị chặn: " + e.getMessage());
        }
    }

    @GetMapping("/suggestions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFriendSuggestions(HttpServletRequest request) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

            List<Map<String, Object>> suggestions = friendshipService.getFriendSuggestions(currentUser.getId());

            List<Map<String, Object>> suggestionsWithImages = suggestions.stream()
                    .map(suggestion -> {
                        Map<String, Object> suggestionWithImage = new HashMap<>(suggestion);
                        Object avatar = suggestion.get("avatar");
                        String avatarWithDomain = avatar != null
                                ? ImageUtils.addDomainToImage(avatar.toString(), request)
                                : null;
                        suggestionWithImage.put("avatar", avatarWithDomain);
                        return suggestionWithImage;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(suggestionsWithImages);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách gợi ý kết bạn: " + e.getMessage());
        }
    }

    @GetMapping("/status/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFriendshipStatus(@PathVariable Long userId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

            Map<String, Object> status = friendshipService.getFriendshipStatus(currentUser.getId(), userId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy trạng thái kết bạn: " + e.getMessage());
        }
    }

    @DeleteMapping("/{friendshipId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> removeFriend(@PathVariable Long friendshipId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            friendshipService.removeFriend(friendshipId, currentUserEmail);
            return ResponseEntity.ok().build();
        } catch (FriendshipException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi xóa bạn bè: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}/friends")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getFriendsByUserId(@PathVariable Long userId, HttpServletRequest request) {
        try {
            List<Map<String, Object>> friends = friendshipService.getFriends(userId)
                    .stream()
                    .map(friendship -> mapFriendshipToResponse(friendship, request))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(friends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi lấy danh sách bạn bè: " + e.getMessage());
        }
    }

    // Helper methods
    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private Map<String, Object> mapSentFriendshipToResponse(Friendship friendship, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", friendship.getId());
        response.put("status", friendship.getStatus());
        response.put("user", mapUserBasicInfo(friendship.getReceiver(), request));
        response.put("createdAt", friendship.getCreatedAt());
        response.put("acceptedAt", friendship.getAcceptedAt());
        response.put("active", friendship.isActive());
        return response;
    }

    private Map<String, Object> mapFriendshipToResponse(Friendship friendship, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", friendship.getId());
        response.put("status", friendship.getStatus());

        // Lấy thông tin người bạn (không phải người dùng hiện tại)
        String currentUserEmail = getCurrentUserEmail();
        User otherUser;

        // Nếu người dùng hiện tại là người gửi, lấy người nhận làm bạn
        if (friendship.getRequester().getEmail().equals(currentUserEmail)) {
            otherUser = friendship.getReceiver();
        }
        // Nếu người dùng hiện tại là người nhận, lấy người gửi làm bạn
        else {
            otherUser = friendship.getRequester();
        }

        response.put("user", mapUserBasicInfo(otherUser, request));
        response.put("createdAt", friendship.getCreatedAt());
        response.put("acceptedAt", friendship.getAcceptedAt());
        response.put("active", friendship.isActive());

        return response;
    }

    private Map<String, Object> mapUserBasicInfo(User user, HttpServletRequest request) {
        user = ImageUtils.addDomainToImage(user, request);
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", user.getId());
        userInfo.put("email", user.getEmail());
        userInfo.put("firstName", user.getFirstName());
        userInfo.put("lastName", user.getLastName());
        userInfo.put("avatar", user.getAvatar());
        return userInfo;
    }

    @GetMapping("/{friendshipId}/other-user")
    public ResponseEntity<User> getOtherUserInFriendship(
            @PathVariable Long friendshipId,
            @RequestParam Long userId) {
        try {
            User otherUser = friendshipService.getOtherUserInFriendship(friendshipId, userId);
            return ResponseEntity.ok(otherUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}