package org.example.backend.service;

import org.example.backend.entity.User;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public void sendFriendRequestNotification(User sender, User receiver) {
        // TODO: Implement notification logic
    }

    public void sendFriendRequestAcceptedNotification(User accepter, User requester) {
        // TODO: Implement notification logic
    }
}