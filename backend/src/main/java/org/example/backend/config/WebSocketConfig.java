package org.example.backend.config;

import org.example.backend.security.JwtHandshakeInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    public WebSocketConfig(JwtHandshakeInterceptor jwtHandshakeInterceptor) {
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // Kênh để broadcast tin nhắn
        config.setApplicationDestinationPrefixes("/app"); // Prefix cho endpoint gửi tin nhắn
        config.setUserDestinationPrefix("/user"); // Prefix cho tin nhắn cá nhân
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws") // Endpoint kết nối WebSocket
                .setAllowedOrigins("http://localhost:5173", "http://localhost:5173/") // Frontend origin
                .addInterceptors(jwtHandshakeInterceptor)
                .withSockJS(); // Hỗ trợ SockJS cho các trình duyệt không hỗ trợ WebSocket
    }
}
