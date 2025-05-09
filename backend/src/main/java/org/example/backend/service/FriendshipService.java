package org.example.backend.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Friendship;
import org.example.backend.entity.User;
import org.example.backend.exception.FriendshipException;
import org.example.backend.repository.FriendshipRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Transactional
    public Friendship createFriendRequest(String requesterEmail, String receiverEmail) {
        // Validate users exist
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người gửi không tồn tại"));
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người nhận không tồn tại"));

        // Check if friendship already exists
        Optional<Friendship> existingFriendship = friendshipRepository.findByRequesterAndReceiver(requester, receiver);
        if (existingFriendship.isPresent()) {
            Friendship friendship = existingFriendship.get();
            if (friendship.getStatus() == Friendship.FriendshipStatus.PENDING) {
                throw new FriendshipException("Đã gửi lời mời kết bạn trước đó");
            } else if (friendship.getStatus() == Friendship.FriendshipStatus.ACCEPTED && friendship.isActive()) {
                throw new FriendshipException("Đã là bạn bè");
            } else if (friendship.getStatus() == Friendship.FriendshipStatus.BLOCKED) {
                throw new FriendshipException("Không thể gửi lời mời kết bạn");
            } else if (friendship.getStatus() == Friendship.FriendshipStatus.REJECTED) {
                // Reuse existing friendship but reset to PENDING
                friendship.setStatus(Friendship.FriendshipStatus.PENDING);
                friendship.setActive(true);
                return friendshipRepository.save(friendship);
            }
        }

        // Check if reverse friendship exists and is blocked
        Optional<Friendship> reverseFriendship = friendshipRepository.findByRequesterAndReceiver(receiver, requester);
        if (reverseFriendship.isPresent() &&
                reverseFriendship.get().getStatus() == Friendship.FriendshipStatus.BLOCKED) {
            throw new FriendshipException("Không thể gửi lời mời kết bạn");
        }

        // If reverse friendship exists and is PENDING, accept it
        if (reverseFriendship.isPresent() &&
                reverseFriendship.get().getStatus() == Friendship.FriendshipStatus.PENDING) {
            Friendship friendship = reverseFriendship.get();
            friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
            return friendshipRepository.save(friendship);
        }

        // Create new friendship request
        Friendship friendship = Friendship.builder()
                .requester(requester)
                .receiver(receiver)
                .status(Friendship.FriendshipStatus.PENDING)
                .active(true)
                .build();

        return friendshipRepository.save(friendship);
    }

    @Transactional
    public void cancelFriendRequest(String requesterEmail, String receiverEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người gửi không tồn tại"));
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người nhận không tồn tại"));

        Friendship friendship = friendshipRepository.findByRequesterAndReceiverAndStatus(
                requester, receiver, Friendship.FriendshipStatus.PENDING)
                .orElseThrow(() -> new FriendshipException("Không tìm thấy lời mời kết bạn"));

        friendshipRepository.delete(friendship);
    }

    @Transactional
    public Friendship acceptFriendRequest(Long friendshipId, String receiverEmail) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new FriendshipException("Không tìm thấy yêu cầu kết bạn"));

        // Verify the current user is the receiver of this friend request
        if (!friendship.getReceiver().getId().equals(receiver.getId())) {
            throw new FriendshipException("Không có quyền chấp nhận yêu cầu kết bạn này");
        }

        if (friendship.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new FriendshipException("Yêu cầu kết bạn không còn ở trạng thái chờ xác nhận");
        }

        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendship.setAcceptedAt(LocalDateTime.now());
        return friendshipRepository.save(friendship);
    }

    @Transactional
    public Friendship rejectFriendRequest(Long friendshipId, String receiverEmail) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new FriendshipException("Không tìm thấy yêu cầu kết bạn"));

        // Verify the current user is the receiver of this friend request
        if (!friendship.getReceiver().getId().equals(receiver.getId())) {
            throw new FriendshipException("Không có quyền từ chối yêu cầu kết bạn này");
        }

        if (friendship.getStatus() != Friendship.FriendshipStatus.PENDING) {
            throw new FriendshipException("Yêu cầu kết bạn không còn ở trạng thái chờ xác nhận");
        }

        friendship.setStatus(Friendship.FriendshipStatus.REJECTED);
        return friendshipRepository.save(friendship);
    }

    @Transactional
    public Friendship blockUser(String blockerEmail, Long blockeeId) {
        User blocker = userRepository.findByEmail(blockerEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        User blockee = userRepository.findById(blockeeId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng bị chặn không tồn tại"));

        // Check if there's an existing friendship
        Optional<Friendship> existingFriendship = friendshipRepository.findByRequesterAndReceiver(blocker, blockee);
        if (existingFriendship.isPresent()) {
            Friendship friendship = existingFriendship.get();
            friendship.setStatus(Friendship.FriendshipStatus.BLOCKED);
            return friendshipRepository.save(friendship);
        }

        // Check if there's a reverse friendship (convert it to blocker->blockee)
        Optional<Friendship> reverseFriendship = friendshipRepository.findByRequesterAndReceiver(blockee, blocker);
        if (reverseFriendship.isPresent()) {
            // Delete the reverse friendship
            friendshipRepository.delete(reverseFriendship.get());
        }

        // Create new block relationship
        Friendship friendship = Friendship.builder()
                .requester(blocker)
                .receiver(blockee)
                .status(Friendship.FriendshipStatus.BLOCKED)
                .active(true)
                .build();

        return friendshipRepository.save(friendship);
    }

    @Transactional
    public void unblockUser(String blockerEmail, Long blockeeId) {
        User blocker = userRepository.findByEmail(blockerEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));
        User blockee = userRepository.findById(blockeeId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng bị chặn không tồn tại"));

        Friendship friendship = friendshipRepository.findByRequesterAndReceiverAndStatus(
                blocker, blockee, Friendship.FriendshipStatus.BLOCKED)
                .orElseThrow(() -> new FriendshipException("Không tìm thấy người dùng bị chặn"));

        friendshipRepository.delete(friendship);
    }

    public List<Friendship> getPendingFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        return friendshipRepository.findByReceiverAndStatus(user, Friendship.FriendshipStatus.PENDING);
    }

    public List<Friendship> getSentFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        return friendshipRepository.findByRequesterAndStatus(user, Friendship.FriendshipStatus.PENDING);
    }

    public List<Friendship> getFriends(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        // Tìm tất cả bạn bè từ cả hai hướng (người dùng là người gửi hoặc người nhận)
        List<Friendship> friends = friendshipRepository.findByRequesterIdOrReceiverId(userId, userId)
                .stream()
                .filter(friendship -> friendship.getStatus() == Friendship.FriendshipStatus.ACCEPTED &&
                        friendship.isActive())
                .collect(Collectors.toList());

        // Debug log
        System.out.println("User " + userId + " has " + friends.size() + " friends");
        friends.forEach(f -> System.out.println("Friend: " +
                (f.getRequester().getId().equals(userId) ? f.getReceiver().getId() : f.getRequester().getId())));

        return friends;
    }

    public List<Friendship> getBlockedUsers(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        return friendshipRepository.findByRequesterAndStatus(user, Friendship.FriendshipStatus.BLOCKED);
    }

    @Transactional
    public void removeFriend(Long friendshipId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new FriendshipException("Không tìm thấy mối quan hệ bạn bè"));

        // Verify the current user is part of this friendship
        if (!friendship.getRequester().getId().equals(user.getId()) &&
                !friendship.getReceiver().getId().equals(user.getId())) {
            throw new FriendshipException("Không có quyền xóa mối quan hệ bạn bè này");
        }

        if (friendship.getStatus() != Friendship.FriendshipStatus.ACCEPTED) {
            throw new FriendshipException("Không phải là bạn bè");
        }

        friendshipRepository.delete(friendship);
    }

    public List<Map<String, Object>> getFriendSuggestions(Long userId) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng không tồn tại"));

        // Get all users
        List<User> allUsers = userRepository.findAll();

        // Get current friends
        List<Friendship> friends = getFriends(userId);
        Set<Long> friendIds = new HashSet<>();

        for (Friendship friendship : friends) {
            if (friendship.getRequester().getId().equals(userId)) {
                friendIds.add(friendship.getReceiver().getId());
            } else {
                friendIds.add(friendship.getRequester().getId());
            }
        }

        // Get sent requests
        List<Friendship> sentRequests = getSentFriendRequests(userId);
        Set<Long> sentRequestIds = sentRequests.stream()
                .map(request -> request.getReceiver().getId())
                .collect(Collectors.toSet());

        // Get received requests
        List<Friendship> receivedRequests = getPendingFriendRequests(userId);
        Set<Long> receivedRequestIds = receivedRequests.stream()
                .map(request -> request.getRequester().getId())
                .collect(Collectors.toSet());

        // Get blocked users
        List<Friendship> blockedUsers = getBlockedUsers(userId);
        Set<Long> blockedUserIds = blockedUsers.stream()
                .map(blocked -> blocked.getReceiver().getId())
                .collect(Collectors.toSet());

        // Get users who blocked current user
        List<Friendship> blockedBy = friendshipRepository.findByReceiverAndStatus(currentUser,
                Friendship.FriendshipStatus.BLOCKED);
        Set<Long> blockedByIds = blockedBy.stream()
                .map(blocked -> blocked.getRequester().getId())
                .collect(Collectors.toSet());

        // Filter users for suggestions
        return allUsers.stream()
                .filter(user -> !user.getId().equals(userId)) // Exclude current user
                .filter(user -> !friendIds.contains(user.getId())) // Exclude friends
                .filter(user -> !sentRequestIds.contains(user.getId())) // Exclude sent requests
                .filter(user -> !receivedRequestIds.contains(user.getId())) // Exclude received requests
                .filter(user -> !blockedUserIds.contains(user.getId())) // Exclude blocked users
                .filter(user -> !blockedByIds.contains(user.getId())) // Exclude users who blocked current user
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("lastName", user.getLastName());
                    userMap.put("email", user.getEmail());
                    userMap.put("avatar", user.getAvatar());

                    // Calculate mutual friends
                    List<Friendship> userFriends = getFriends(user.getId());
                    Set<Long> userFriendIds = new HashSet<>();

                    for (Friendship friendship : userFriends) {
                        if (friendship.getRequester().getId().equals(user.getId())) {
                            userFriendIds.add(friendship.getReceiver().getId());
                        } else {
                            userFriendIds.add(friendship.getRequester().getId());
                        }
                    }

                    long mutualFriends = userFriendIds.stream()
                            .filter(friendIds::contains)
                            .count();

                    userMap.put("mutualFriends", mutualFriends);
                    return userMap;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getFriendshipStatus(Long currentUserId, Long otherUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng hiện tại không tồn tại"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new EntityNotFoundException("Người dùng khác không tồn tại"));

        Map<String, Object> result = new HashMap<>();
        result.put("status", "NOT_FRIENDS");
        result.put("friendshipId", null);

        // Check if current user sent a request to other user
        Optional<Friendship> sentRequest = friendshipRepository.findByRequesterAndReceiver(currentUser, otherUser);
        if (sentRequest.isPresent()) {
            result.put("status", sentRequest.get().getStatus().toString());
            result.put("friendshipId", sentRequest.get().getId());
            return result;
        }

        // Check if other user sent a request to current user
        Optional<Friendship> receivedRequest = friendshipRepository.findByRequesterAndReceiver(otherUser, currentUser);
        if (receivedRequest.isPresent()) {
            String status = receivedRequest.get().getStatus().toString();
            if (status.equals("PENDING")) {
                result.put("status", "PENDING_RECEIVED");
            } else {
                result.put("status", status);
            }
            result.put("friendshipId", receivedRequest.get().getId());
            return result;
        }

        return result;
    }

    public User getOtherUserInFriendship(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friendship not found"));

        if (friendship.getRequester().getId().equals(userId)) {
            return friendship.getReceiver();
        } else if (friendship.getReceiver().getId().equals(userId)) {
            return friendship.getRequester();
        } else {
            throw new RuntimeException("User is not part of this friendship");
        }
    }
}