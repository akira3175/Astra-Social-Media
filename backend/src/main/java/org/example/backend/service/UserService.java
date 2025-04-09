package org.example.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.entity.User;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;

    // Tạo user mới (mã hóa mật khẩu)
    public User createUser(User user) {
        user.setDateJoined(LocalDateTime.now());
        user.setIsSuperUser(false);
        user.setIsStaff(false);
        user.setIsActive(true);
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Hash password
        return userRepository.save(user);
    }

    public User updateUser(String email, String firstName, String lastName, MultipartFile avatar, MultipartFile background) throws IOException {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // Cập nhật firstName và lastName nếu có
        if (firstName != null && !firstName.isEmpty()) {
            user.setFirstName(firstName);
        }
        if (lastName != null && !lastName.isEmpty()) {
            user.setLastName(lastName);
        }

        // Cập nhật avatar nếu có
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = fileStorageService.saveFile(avatar);
            user.setAvatar(avatarUrl);
        }

        // Cập nhật background nếu có
        if (background != null && !background.isEmpty()) {
            String backgroundUrl = fileStorageService.saveFile(background);
            user.setBackground(backgroundUrl);
        }

        userRepository.save(user);
        return user;
    }

    // Kiểm tra user đăng nhập hợp lệ
    @Transactional
    public Map<String, String> login(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            if (passwordEncoder.matches(password, user.getPassword())) {
                // Xóa refresh token cũ (nếu có)
                refreshTokenRepository.deleteByEmail(email);

                // Tạo token mới
                String accessToken = jwtUtil.generateAccessToken(email);
                String refreshToken = jwtUtil.generateRefreshToken(email);

                // Cập nhật lastLogin
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);

                return Map.of(
                        "accessToken", accessToken,
                        "refreshToken", refreshToken);
            }
        }
        return null;
    }

    // Lấy user theo email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User getUserInfo(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }




    // Provide ADMIN API
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
        return user;
    }

    public User banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return user;
    }
}
