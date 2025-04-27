package org.example.backend.websocket;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketEventListener {

    private final Map<String, Boolean> userOnlineStatus = new ConcurrentHashMap<>();

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
}
