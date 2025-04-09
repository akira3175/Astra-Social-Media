package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.User;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.UserService;
import org.example.backend.websocket.WebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private WebSocketHandler webSocketHandler;

    // API tạo User
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        User newUser = userService.createUser(user);
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        Map<String, String> tokens = userService.login(email, password);

        if (tokens != null) {
            return ResponseEntity.ok(tokens);
        }

        return ResponseEntity.status(401).body("Invalid email or password");
    }

    // API làm mới Access Token
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body("Refresh token is required");
        }

        return refreshTokenRepository.findByToken(refreshToken)
                .map(token -> {
                    if (token.getExpiryDate().isBefore(Instant.now())) {
                        refreshTokenRepository.delete(token); // Xóa token hết hạn
                        return ResponseEntity.status(401).body("Refresh token expired");
                    }

                    String email = jwtUtil.extractEmail(refreshToken);
                    if (jwtUtil.isTokenValid(refreshToken, email)) {
                        String newAccessToken = jwtUtil.generateAccessToken(email);
                        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
                    } else {
                        return ResponseEntity.status(401).body("Invalid refresh token");
                    }
                })
                .orElse(ResponseEntity.status(401).body("Refresh token not found"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        refreshTokenRepository.deleteByEmail(email);
        return ResponseEntity.ok("User logged out successfully");
    }

    // API lấy User theo email
    @GetMapping("/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email, HttpServletRequest request) {
        Optional<User> optionalUser = userService.getUserByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();

        // 🔥 Lấy base URL động
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();

        // 🔥 Thêm domain vào avatar và background nếu có
        user.setAvatar((user.getAvatar() != null && !user.getAvatar().isEmpty()) ? baseUrl + user.getAvatar() : null);
        user.setBackground((user.getBackground() != null && !user.getBackground().isEmpty()) ? baseUrl + user.getBackground() : null);

        // 🔥 Tạo response từ user
        User response = user.toBuilder().build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token, HttpServletRequest request) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        User user = userService.getUserInfo(email); // Thay đổi từ findByEmail nếu cần

        // 🔥 Lấy base URL động
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();

        // 🔥 Thêm domain vào avatar và background
        user.setAvatar((user.getAvatar() != null && !user.getAvatar().isEmpty()) ? baseUrl + user.getAvatar() : null);
        user.setBackground((user.getBackground() != null && !user.getBackground().isEmpty()) ? baseUrl + user.getBackground() : null);

        // 🔥 Trả về response có đường dẫn đầy đủ
        User response = user.toBuilder()
                .build();

        return ResponseEntity.ok(response);
    }

    @PatchMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "background", required = false) MultipartFile background,
            HttpServletRequest request) {

        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();

        try {
            User updatedUser = userService.updateUser(email, firstName, lastName, avatar, background);
            updatedUser.setAvatar((updatedUser.getAvatar() != null && !updatedUser.getAvatar().isEmpty()) ? baseUrl + updatedUser.getAvatar() : null);
            updatedUser.setBackground((updatedUser.getBackground() != null && !updatedUser.getBackground().isEmpty()) ? baseUrl + updatedUser.getBackground() : null);
            return ResponseEntity.ok(updatedUser);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error saving profile");
        }
    }

    @GetMapping("/{email}/online")
    public Map<String, Object> checkOnline(@PathVariable String email) {
        boolean isOnline = webSocketHandler.isUserOnline(email);
        return Map.of("email", email, "is_online", isOnline);
    }

    // API lấy trạng thái online của tất cả người dùng
    @GetMapping("/all-online-status")
    public ResponseEntity<Map<String, Boolean>> getAllOnlineStatus() {
        Map<String, Boolean> onlineStatus = webSocketHandler.getAllUsersOnlineStatus();
        return ResponseEntity.ok(onlineStatus);
    }
}
