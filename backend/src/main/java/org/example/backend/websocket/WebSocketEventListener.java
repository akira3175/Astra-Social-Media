package org.example.backend.websocket;

import org.example.backend.dto.FriendStatusUpdateDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.example.backend.service.UserService;

/**
 * Lớp này quản lý sự kiện WebSocket và trạng thái trực tuyến của người dùng
 */
@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    // Sử dụng ConcurrentHashMap để đảm bảo thread-safety
    private final Map<String, Boolean> userOnlineStatus = new ConcurrentHashMap<>();

    @Autowired
    private UserService userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Xử lý sự kiện kết nối WebSocket
     * @param event sự kiện kết nối
     */
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) {
            logger.warn("User authentication missing in WebSocket connection");
            return;
        }

        String email = accessor.getUser().getName();
        if (email != null) {
            userOnlineStatus.put(email, true);
            logger.info("User connected: {} is ONLINE", email);

            // Thông báo cho bạn bè về trạng thái online
            notifyFriendsStatusChange(email, true);
        } else {
            logger.warn("WebSocket connection with null email detected");
        }
    }

    /**
     * Xử lý sự kiện ngắt kết nối WebSocket
     * @param event sự kiện ngắt kết nối
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() == null) {
            logger.warn("User authentication missing in WebSocket disconnection");
            return;
        }

        String email = accessor.getUser().getName();
        if (email != null) {
            userOnlineStatus.remove(email);
            logger.info("User disconnected: {} is OFFLINE", email);

            // Thông báo cho bạn bè về trạng thái offline
            notifyFriendsStatusChange(email, false);
        } else {
            logger.warn("WebSocket disconnection with null email detected");
        }
    }

    /**
     * Kiểm tra xem người dùng có đang online không
     * @param email email của người dùng
     * @return true nếu người dùng online, false nếu không
     */
    public boolean isUserOnline(String email) {
        if (email == null) {
            return false;
        }
        return userOnlineStatus.containsKey(email);
    }

    /**
     * Lấy trạng thái online của tất cả người dùng
     * @return map chứa email và trạng thái online
     */
    public Map<String, Boolean> getAllUsersOnlineStatus() {
        return Collections.unmodifiableMap(userOnlineStatus);
    }

    /**
     * Lấy trạng thái online của danh sách bạn bè
     * @param friendEmails danh sách email của bạn bè
     * @return map chứa email và trạng thái online của bạn bè
     */
    public Map<String, Boolean> getFriendsOnlineStatus(List<String> friendEmails) {
        if (friendEmails == null || friendEmails.isEmpty()) {
            return Collections.emptyMap();
        }

        return userOnlineStatus.entrySet().stream()
                .filter(entry -> friendEmails.contains(entry.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    /**
     * Đếm số người dùng đang online
     * @return số người dùng đang online
     */
    public int countOnlineUsers() {
        return userOnlineStatus.size();
    }

    /**
     * Thông báo cho bạn bè về sự thay đổi trạng thái
     * @param email email của người dùng thay đổi trạng thái
     * @param isOnline trạng thái online mới
     */
    private void notifyFriendsStatusChange(String email, boolean isOnline) {
        try {
            List<String> friendsEmails = userService.getFriendsEmails(email);
            if (friendsEmails == null || friendsEmails.isEmpty()) {
                return;
            }

            for (String friendEmail : friendsEmails) {
                try {
                    messagingTemplate.convertAndSendToUser(
                            friendEmail,
                            "/queue/friend-status",
                            new FriendStatusUpdateDTO(email, isOnline)
                    );
                    logger.debug("Sent status update to {}: {} is {}",
                            friendEmail, email, isOnline ? "ONLINE" : "OFFLINE");
                } catch (Exception e) {
                    logger.error("Error sending status update to {}: {}", friendEmail, e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error getting friends for {}: {}", email, e.getMessage());
        }
    }
}