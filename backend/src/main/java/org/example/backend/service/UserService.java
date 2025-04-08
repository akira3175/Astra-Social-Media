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
import org.example.backend.entity.Friendship;
import org.example.backend.repository.FriendshipRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;
    private final FriendshipRepository friendshipRepository;

    // Tạo user mới (mã hóa mật khẩu)
    public User createUser(User user) {
        user.setDateJoined(LocalDateTime.now());
        user.setIsSuperUser(false);
        user.setIsStaff(false);
        user.setIsActive(true);
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Hash password
        return userRepository.save(user);
    }

    public User updateUser(String email, String firstName, String lastName, MultipartFile avatar,
            MultipartFile background) throws IOException {
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

    public List<Map<String, Object>> getSuggestedUsers(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Current user not found"));

        return userRepository.findTop6ByOrderByMutualFriendsDesc().stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("name", user.getName());
                    userMap.put("avatar", user.getAvatar());
                    userMap.put("mutualFriends", user.getMutualFriends() != null ? user.getMutualFriends() : 0);
                    userMap.put("status", null);

                    // Tìm friendship giữa currentUser và user
                    Optional<Friendship> friendship = friendshipRepository.findByUser1AndUser2(currentUser, user);
                    if (!friendship.isPresent()) {
                        friendship = friendshipRepository.findByUser1AndUser2(user, currentUser);
                    }

                    if (friendship.isPresent()) {
                        System.out.println(
                                "Found friendship for user " + user.getName() + ": " + friendship.get().getId());
                        userMap.put("friendshipStatus", friendship.get().getStatus().name());
                        userMap.put("isUser1", friendship.get().getUser1().getId().equals(currentUserId));
                        userMap.put("friendshipId", friendship.get().getId());
                    } else {
                        System.out.println("No friendship found for user " + user.getName());
                        userMap.put("friendshipStatus", null);
                        userMap.put("isUser1", null);
                        userMap.put("friendshipId", null);
                    }

                    return userMap;
                })
                .collect(Collectors.toList());
    }

    public List<User> getFriendsList(String userId) {
        try {
            Long id = Long.parseLong(userId);
            return userRepository.findFriendsById(id);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user ID format");
        }
    }
}
