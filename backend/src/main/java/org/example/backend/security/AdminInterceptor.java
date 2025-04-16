package org.example.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.entity.User;
import org.example.backend.exception.AppException;
import org.example.backend.service.UserService;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.example.backend.exception.ErrorCode;

@Component
public class AdminInterceptor implements HandlerInterceptor {
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AdminInterceptor(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception{


        if (true) return true; // tạm thời bỏ qua xác thực để debug


        // Chỉ kiểm tra các request đến /api/admin/
        if (!request.getRequestURI().startsWith("/api/admin/")) {
            return true;
        }

        // Kiểm tra xem handler có phải là HandlerMethod không
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RequireAdmin requireAdmin = handlerMethod.getMethodAnnotation(RequireAdmin.class);

        // Nếu phương thức không có annotation @RequireAdmin, cho phép truy cập
        if (requireAdmin == null) {
            return true;
        }

        // Kiểm tra token và quyền admin
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }

        String token = authHeader.replace("Bearer ", "");
        try {
            String email = jwtUtil.extractEmail(token);
            if (email == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return false;
            }

            // Lấy thông tin user
            User user = userService.getUserInfo(email);
            if (user == null || !user.getIsSuperUser()) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return false;
            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
    }
} 