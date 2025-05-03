package org.example.backend.controller;

import org.example.backend.entity.Notification;
import org.example.backend.entity.User;
import org.example.backend.repository.NotificationRepository;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.NotificationService;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.backend.dto.NotificationDTO;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private UserService userService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    @PutMapping("/mark-as-read/{id}")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
            User user = userService.getUserInfo(email);
            notificationService.markAsRead(id, user);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public Page<NotificationDTO> getUserNotifications(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String userEmail = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        User user = userService.getUserInfo(userEmail);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return notificationRepository
                .findByReceiverIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(notificationService::toDTO);
    }

    @PostMapping("/send")
    public void sendNotification(@RequestBody Notification notification) {
        // Ví dụ bạn có thể map userId -> email bằng DB ở đây
        String receiverEmail = getEmailByUserId(notification.getReceiverId());

        notificationService.sendToUser(receiverEmail, notification);
    }

    private String getEmailByUserId(Long id) {
        return "akira31758421@gmail.com";
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        User user = userService.getUserInfo(email);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<?> deleteNotification(
            @PathVariable Long notificationId,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
            User user = userService.getUserInfo(email);
            notificationService.deleteNotification(notificationId, user);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
