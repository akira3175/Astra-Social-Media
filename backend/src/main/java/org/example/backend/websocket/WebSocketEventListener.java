package org.example.backend.websocket;

import org.example.backend.dto.FriendStatusUpdateDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.example.backend.service.UserService;

@Component
public class WebSocketEventListener {

    private final Map<String, Boolean> userOnlineStatus = new ConcurrentHashMap<>();

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String email = accessor.getUser().getName();
        if (email != null) {
            userOnlineStatus.put(email, true);
            System.out.println(email + " is ONLINE");
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String email = accessor.getUser().getName();
        if (email != null) {
            userOnlineStatus.remove(email);
            System.out.println(email + " is OFFLINE");
        }
    }

    public boolean isUserOnline(String email) {
        return userOnlineStatus.containsKey(email);
    }

    public Map<String, Boolean> getAllUsersOnlineStatus() {
        return Map.copyOf(userOnlineStatus);
    }

    public Map<String, Boolean> getFriendsOnlineStatus(List<String> friendEmails) {
        return userOnlineStatus.entrySet().stream()
                .filter(entry -> friendEmails.contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }    

    private void notifyFriendsStatusChange(String email, boolean isOnline) {
        List<String> friendsEmails = userService.getFriendsEmails(email); 
        for (String friendEmail : friendsEmails) {
            messagingTemplate.convertAndSendToUser(
                    friendEmail,
                    "/queue/friend-status",
                    new FriendStatusUpdateDTO(email, isOnline)
            );
        }
    }
}
