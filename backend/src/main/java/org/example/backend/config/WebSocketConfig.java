package org.example.backend.config;

import org.example.backend.security.JwtHandshakeHandler;
import org.example.backend.security.JwtHandshakeInterceptor;
import org.example.backend.security.WebSocketAuthChannelInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor webSocketAuthChannelInterceptor;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;

    public WebSocketConfig(JwtHandshakeInterceptor jwtHandshakeInterceptor, WebSocketAuthChannelInterceptor webSocketAuthChannelInterceptor) {
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
        this.webSocketAuthChannelInterceptor = webSocketAuthChannelInterceptor;
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
                .setAllowedOrigins("http://localhost:5173",
                        "https://astrasocial.netlify.app") // Frontend origin
                .addInterceptors(jwtHandshakeInterceptor)
                .setHandshakeHandler(new JwtHandshakeHandler())
                .withSockJS(); // Hỗ trợ SockJS cho các trình duyệt không hỗ trợ WebSocket
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthChannelInterceptor);
    }
}
