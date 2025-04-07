package org.example.backend.controller;

import org.example.backend.entity.Friendship;
import org.example.backend.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        Friendship friendship = friendshipService.acceptFriendRequest(friendshipId);
        return ResponseEntity.ok(friendship);
    }

    @PostMapping("/reject/{friendshipId}")
    public ResponseEntity<Friendship> rejectFriendRequest(@PathVariable Long friendshipId) {
        Friendship friendship = friendshipService.rejectFriendRequest(friendshipId);
        return ResponseEntity.ok(friendship);
    }

    @GetMapping("/pending/{userId}")
    public ResponseEntity<List<Friendship>> getPendingFriendRequests(@PathVariable Long userId) {
        List<Friendship> pendingRequests = friendshipService.getPendingFriendRequests(userId);
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Friendship>> getFriends(@PathVariable Long userId) {
        List<Friendship> friends = friendshipService.getFriends(userId);
        return ResponseEntity.ok(friends);
    }
}