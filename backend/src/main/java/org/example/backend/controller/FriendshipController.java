package org.example.backend.controller;

import org.example.backend.entity.Friendship;
import org.example.backend.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    @PostMapping("/request")
    public ResponseEntity<Friendship> sendFriendRequest(@RequestParam Long userId1, @RequestParam Long userId2) {
        System.out.println("Received friend request from user " + userId1 + " to user " + userId2);
        Friendship friendship = friendshipService.sendFriendRequest(userId1, userId2);
        System.out.println("Created friendship: " + friendship);
        return ResponseEntity.ok(friendship);
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
}