package org.example.backend.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    // Sử dụng ConcurrentHashMap để lưu trữ session theo email người dùng
//    private final Map<String, WebSocketSession> onlineSessions = new ConcurrentHashMap<>();
    private final Map<String, Boolean> userOnlineStatus = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String email = (String) session.getAttributes().get("email");
        if (email != null) {
            userOnlineStatus.put(email, true);  // Lưu session vào map
            System.out.println(email + " is ONLINE");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String email = (String) session.getAttributes().get("email");
        if (email != null) {
            userOnlineStatus.remove(email);  // Xóa session khỏi map khi kết nối đóng
            System.out.println(email + " is OFFLINE");
        }
    }

    public boolean isUserOnline(String email) {
        return userOnlineStatus.containsKey(email);  // Kiểm tra xem người dùng có trong danh sách online không
    }

    // API để lấy trạng thái online của tất cả người dùng
    public Map<String, Boolean> getAllUsersOnlineStatus() {
        return new HashMap<>(userOnlineStatus); // Trả về bản sao của trạng thái online
    }
}
