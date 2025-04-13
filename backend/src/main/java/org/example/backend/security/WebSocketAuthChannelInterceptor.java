package org.example.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (accessor.getCommand() != null && accessor.getCommand().getMessageType().name().equals("CONNECT")) {
            String token = accessor.getFirstNativeHeader("Authorization");
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            if (!token.isEmpty()) {
                try {
                    String email = jwtUtil.extractEmail(token);
                    Principal user = () -> email;
                    accessor.setUser(user); // Gán Principal để Spring sử dụng
                } catch (Exception e) {
                    System.out.println("Invalid token in CONNECT: " + e.getMessage());
                }
            }
        }

        return message;
    }
}
