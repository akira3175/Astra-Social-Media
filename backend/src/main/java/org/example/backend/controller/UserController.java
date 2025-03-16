package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.User;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        return ResponseEntity.ok(userService.getUserInfo(email));
    }
}
