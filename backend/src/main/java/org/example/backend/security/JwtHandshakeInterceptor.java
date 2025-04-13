package org.example.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import java.security.Principal;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtil jwtUtils; // class để decode JWT

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest req = servletRequest.getServletRequest();

            // Thử lấy token từ tham số
            String token = req.getParameter("token");

            // Thử lấy token từ header nếu không có trong tham số
            if (token == null || token.isEmpty()) {
                String authHeader = req.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            // Xử lý trường hợp token đã có Bearer prefix
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            // Nếu không có token, cho phép kết nối không xác thực (tạm thời để debug)
            if (token == null || token.isEmpty()) {
                System.out.println("Warning: No JWT token found in request");
                return true;
            }

            try {
                String email = jwtUtils.extractEmail(token);
                System.out.println("WebSocket authenticated for user: " + email);
                attributes.put("email", email); // Gán vào session attributes

                // Tạo Principal để Spring sử dụng trong STOMP
                Principal userPrincipal = () -> email;

                // Gán Principal vào request để các sự kiện như SessionConnectedEvent lấy được
                servletRequest.getServletRequest().setAttribute("SPRING.PRINCIPAL", userPrincipal);
                return true;
            } catch (Exception e) {
                System.out.println("Invalid JWT: " + e.getMessage());
                // Cho phép kết nối không xác thực (tạm thời để debug)
                return true;
            }
        }
        // Cho phép kết nối không xác thực (tạm thời để debug)
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
        // Không làm gì
    }
}
