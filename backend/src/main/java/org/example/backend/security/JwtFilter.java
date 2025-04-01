package org.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();

        // Bỏ qua JWT filter cho API refresh token và public endpoints
        if (path.equals("/api/users/login") ||
                path.equals("/api/users/register") ||
                path.equals("/api/users/refresh")) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);

        try {
            String email = jwtUtil.extractEmail(token);
            Long userId = jwtUtil.extractUserId(token);

            if (!jwtUtil.isAccessToken(token)) {
                sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "This is a Refresh Token, rejecting...");
                return;
            }

            if (email != null && userId != null && jwtUtil.isTokenValid(token, email)) {
                request.setAttribute("email", email);
                request.setAttribute("userId", userId);
                chain.doFilter(request, response);
            } else {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT token");
            }
        } catch (Exception e) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT: " + e.getMessage());
        }
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String jsonResponse = String.format("{\"status\": %d, \"error\": \"%s\"}", status, message);
        response.getWriter().write(jsonResponse);
    }
}
