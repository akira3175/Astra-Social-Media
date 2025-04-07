package org.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    private final List<String> publicEndpoints = Arrays.asList(
            "/api/users/login",
            "/api/users/register",
            "/api/users/refresh",
            "/uploads");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        System.out.println("Processing request to: " + path);

        // Kiểm tra xem request có phải là public endpoint không
        boolean isPublicEndpoint = publicEndpoints.stream().anyMatch(path::startsWith);
        System.out.println("Is public endpoint: " + isPublicEndpoint);

        if (isPublicEndpoint) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        System.out.println("Authorization header: " + header);

        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("Missing or invalid Authorization header");
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        String token = header.substring(7);
        System.out.println("Token: " + token);

        try {
            String email = jwtUtil.extractEmail(token);
            System.out.println("Extracted email: " + email);

            if (!jwtUtil.isAccessToken(token)) {
                System.out.println("This is a Refresh Token, rejecting...");
                sendErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "This is a Refresh Token, rejecting...");
                return;
            }

            if (email != null && jwtUtil.isTokenValid(token, email)) {
                System.out.println("Token is valid");
                request.setAttribute("email", email);
                chain.doFilter(request, response);
            } else {
                System.out.println("Invalid or expired JWT token");
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT token");
            }
        } catch (Exception e) {
            System.out.println("Error processing token: " + e.getMessage());
            e.printStackTrace();
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
