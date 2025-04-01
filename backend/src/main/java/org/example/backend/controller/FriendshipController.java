package org.example.backend.controller;

import org.example.backend.entity.User;
import org.example.backend.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friendships")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    @PostMapping("/request/{receiverId}")
    public ResponseEntity<?> sendFriendRequest(
            @PathVariable Long receiverId,
            @RequestAttribute("userId") Long userId) {
        friendshipService.sendFriendRequest(userId, receiverId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{friendshipId}/accept")
    public ResponseEntity<?> acceptFriendRequest(
            @PathVariable Long friendshipId,
            @RequestAttribute("userId") Long userId) {
        friendshipService.acceptFriendRequest(friendshipId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{friendshipId}/reject")
    public ResponseEntity<?> rejectFriendRequest(
            @PathVariable Long friendshipId,
            @RequestAttribute("userId") Long userId) {
        friendshipService.rejectFriendRequest(friendshipId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingFriendRequests(
            @RequestAttribute("userId") Long userId) {
        return ResponseEntity.ok(friendshipService.getPendingFriendRequests(userId));
    }

    @GetMapping("/suggestions/{userId}")
    public ResponseEntity<List<User>> getFriendSuggestions(
            @PathVariable Long userId) {
        return ResponseEntity.ok(friendshipService.getFriendSuggestions(userId));
    }
}