package org.example.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.RegisterWithOtpRequest;
import org.example.backend.elasticsearch.document.UserDocument;
import org.example.backend.entity.User;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.OtpService;
import org.example.backend.service.UserService;
import org.example.backend.util.ImageUtils;
import org.example.backend.websocket.WebSocketEventListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;

    @Autowired
    private WebSocketEventListener webSocketEventListener;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterWithOtpRequest request) {
        boolean valid = otpService.verifyOtp(request.email, request.otp);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }

        User user = new User();
        user.setEmail(request.email);
        user.setPassword(request.password);
        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);

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

        ImageUtils.addDomainToImage(user, request);

        User response = user.toBuilder().build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token, HttpServletRequest request) {
        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        Optional<User> optionalUser = userService.getUserByEmail(email);
        User user = optionalUser.orElseThrow(() -> new RuntimeException("User not found"));
        user = ImageUtils.addDomainToImage(user, request);
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
            @RequestParam(value = "bio", required = false) String bio,
            HttpServletRequest request) {

        String email = jwtUtil.extractEmail(token.replace("Bearer ", ""));
        String baseUrl = ImageUtils.getBaseUrl(request);

        try {
            User updatedUser = userService.updateUser(email, firstName, lastName, avatar, background, bio);
            updatedUser.setAvatar((updatedUser.getAvatar() != null && !updatedUser.getAvatar().isEmpty())
                    ? baseUrl + updatedUser.getAvatar()
                    : null);
            updatedUser.setBackground((updatedUser.getBackground() != null && !updatedUser.getBackground().isEmpty())
                    ? baseUrl + updatedUser.getBackground()
                    : null);
            return ResponseEntity.ok(updatedUser);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error saving profile");
        }
    }

    @GetMapping("/{email}/online")
    public Map<String, Object> checkOnline(@PathVariable String email) {
        boolean isOnline = webSocketEventListener.isUserOnline(email);
        return Map.of("email", email, "is_online", isOnline);
    }

    // API lấy trạng thái online của tất cả người dùng
    @GetMapping("/all-online-status")
    public ResponseEntity<Map<String, Boolean>> getAllOnlineStatus() {
        Map<String, Boolean> onlineStatus = webSocketEventListener.getAllUsersOnlineStatus();
        return ResponseEntity.ok(onlineStatus);
    }

    @GetMapping("/search")
    public Page<UserDocument> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "all") String isStaff,
            @RequestParam(required = false, defaultValue = "true") String isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader("Authorization") String token,
            HttpServletRequest request) {
        token = token.replace("Bearer ", "").trim();
        String email = jwtUtil.extractEmail(token);
        User userCurrent = userService.getUserInfo(email);

        Page<UserDocument> users = null;// userService.searchUsers(keyword, isStaff, isActive, page, size, userCurrent);
        return users.map(user -> addDomainToImage(user, request));
    }

    private User addDomainToImage(User user, HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        user.setAvatar((user.getAvatar() != null && !user.getAvatar().isEmpty()) ? baseUrl + user.getAvatar() : null);
        user.setBackground(
                (user.getBackground() != null && !user.getBackground().isEmpty()) ? baseUrl + user.getBackground()
                        : null);
        return user;
    }

    private UserDocument addDomainToImage(UserDocument user, HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        user.setAvatar((user.getAvatar() != null && !user.getAvatar().isEmpty()) ? baseUrl + user.getAvatar() : null);
        user.setBackground(
                (user.getBackground() != null && !user.getBackground().isEmpty()) ? baseUrl + user.getBackground()
                        : null);
        return user;
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        token = token.replace("Bearer ", "").trim();
        String email = jwtUtil.extractEmail(token);
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        boolean success = userService.changePassword(email, oldPassword, newPassword);

        if (success) {
            return ResponseEntity.ok("Password changed successfully");
        } else {
            return ResponseEntity.status(400).body("Old password is incorrect");
        }
    }

    @GetMapping("check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean exists = userService.isEmailExist(email);
        return ResponseEntity.ok(Collections.singletonMap("exists", exists));
    }
}