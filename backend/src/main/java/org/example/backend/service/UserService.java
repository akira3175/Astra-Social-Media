package org.example.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.elasticsearch.document.UserDocument;
import org.example.backend.elasticsearch.repository.UserESRepository;
import org.example.backend.entity.User;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.repository.RefreshTokenRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.security.JwtUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.example.backend.mapper.UserMapper;
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final FileStorageService fileStorageService;
    private final UserESRepository userESRepository;
    private final UserMapper userMapper;

    // Tạo user mới (mã hóa mật khẩu)
    public User createUser(User user) {
        user.setDateJoined(LocalDateTime.now());
        user.setIsSuperUser(false);
        user.setIsStaff(false);
        user.setIsActive(true);
        user.setPassword(passwordEncoder.encode(user.getPassword())); // Hash password

        user = userRepository.save(user);
        saveUserToES(user);

        return user;
    }

    public User updateUser(String email, String firstName, String lastName, MultipartFile avatar,
            MultipartFile background, String bio) throws IOException {
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

        System.out.println(bio);
        if (bio != null && !bio.isEmpty()) {
            user.setBio(bio);
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

        user = userRepository.save(user);
        saveUserToES(user);

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
                user = userRepository.save(user);
                saveUserToES(user);

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

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional
    public User getUserInfo(String email) {
        return userRepository.findByEmail(email)
                .map(user -> User.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .isSuperUser(user.getIsSuperUser())
                        .isStaff(user.getIsStaff())
                        .isActive(user.getIsActive())
                        .build())
                .orElse(null);
    }

    public Page<UserDocument> searchUsers(String keyword, String isStaffStr, String isActiveStr, int page, int size,
            User user) {
        // Convert string to Boolean (or null if "all")
        Boolean isStaff = parseToBoolean(isStaffStr);
        Boolean isActive = parseToBoolean(isActiveStr);

        // Remove empty keyword
        if (keyword != null && keyword.trim().isEmpty()) {
            keyword = null;
        }

        // Default isActive = true if not provided
        if (isActiveStr == null) {
            isActive = true;
        }

        Page<UserDocument> userDocuments;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastLogin"));

        if (user.getIsStaff()) {
            userDocuments = userESRepository.findByFullNameContainingIgnoreCaseAndIsStaffAndIsActive(keyword, isStaff,
                    isActive, pageable);
        } else {
            userDocuments = userESRepository.findByFullNameContainingIgnoreCaseAndIsStaffAndIsActive(keyword, isStaff,
                    false, pageable);
        }

        return userDocuments;
    }

    private Boolean parseToBoolean(String str) {
        if (str == null || str.equalsIgnoreCase("all"))
            return null;
        if (str.equalsIgnoreCase("true"))
            return true;
        if (str.equalsIgnoreCase("false"))
            return false;
        return null;
    }

    public boolean changePassword(String email, String oldPassword, String newPassword) {
        // Tìm user theo email
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            return false; // Không tìm thấy user
        }

        User user = optionalUser.get();

        // So sánh mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return false; // Mật khẩu cũ không đúng
        }

        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));

        user = userRepository.save(user);
        saveUserToES(user);

        return true;
    }

    // Provide ADMIN API
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User unbanUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setIsActive(true);
        userRepository.save(user);
        return user;
    }

    public User banUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setIsActive(false);
        userRepository.save(user);
        return user;
    }

    public boolean isEmailExist(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<String> getAllUsersEmails() {
        return userRepository.findAll().stream()
                .map(User::getEmail)
                .collect(Collectors.toList());
    }

    public List<String> getFriendsEmails(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userRepository.findFriendsByEmail(email).stream()
                .map(User::getEmail)
                .collect(Collectors.toList());
    }

    public void saveUserToES(User user) {
        UserDocument userDocument = userMapper.toDocument(user);
        userESRepository.save(userDocument);
    }

    public void saveAllUsersToES() {
        List<User> users = userRepository.findAll();
        List<UserDocument> userDocuments = users.stream()
                .map(userMapper::toDocument)
                .toList();

        userESRepository.saveAll(userDocuments);
    }

    public Long countAllUsers() {
        return userRepository.countAll();
    }

    public Long countLockedUsers() {
        return userRepository.countByIsActiveFalse();
    }
}
