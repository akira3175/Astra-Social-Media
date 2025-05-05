package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.NotificationDTO;
import org.example.backend.entity.Notification;
import org.example.backend.entity.NotificationType;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.example.backend.entity.Comment;
import org.example.backend.mapper.NotificationMapper;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    public void sendToUser(String email, Notification notification) {
        NotificationDTO dto = notificationMapper.toDTO(notification);
        // Gửi thông báo cá nhân đến người dùng qua WebSocket
        messagingTemplate.convertAndSendToUser(
                email,
                "/queue/notifications",
                dto
        );
    }

    public void notifyLike(User sender, Post post) {
        Notification notification = Notification.builder()
                .senderId(sender.getId())
                .receiverId(post.getUser().getId())
                .type(NotificationType.LIKE)
                .postId(post.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        sendToUser(post.getUser().getEmail(), notification);
    }

    public void notifyCommentLike(User sender, Comment comment) {
        Notification notification = Notification.builder()
                .senderId(sender.getId())
                .receiverId(comment.getUser().getId())
                .type(NotificationType.COMMENT_LIKE)
                .postId(comment.getPost().getId())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        sendToUser(comment.getUser().getEmail(), notification);
    }

    public void notifyComment(Comment comment) {
        User sender = comment.getUser();
        Post post = comment.getPost();

        // Nếu là trả lời comment
        if (comment.getParentComment() != null) {
            User parentUser = comment.getParentComment().getUser();
            if (!parentUser.getId().equals(sender.getId())) {
                Notification noti = Notification.builder()
                        .senderId(sender.getId())
                        .receiverId(parentUser.getId())
                        .type(NotificationType.COMMENT_REPLY)
                        .postId(post.getId())
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(noti);
                sendToUser(parentUser.getEmail(), noti);
            }
        } else {
            // Nếu là comment gốc
            if (!post.getUser().getId().equals(sender.getId())) {
                Notification noti = Notification.builder()
                        .senderId(sender.getId())
                        .receiverId(post.getUser().getId())
                        .type(NotificationType.COMMENT)
                        .postId(post.getId())
                        .createdAt(LocalDateTime.now())
                        .build();
                notificationRepository.save(noti);
                sendToUser(post.getUser().getEmail(), noti);
            }
        }
    }

    public void notifyFriendRequest(User sender, User receiver) {
        Notification notification = Notification.builder()
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .type(NotificationType.FRIEND_REQUEST)
                .postId(null)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
        sendToUser(receiver.getEmail(), notification);
    }

    public void markAsRead(Long notificationId, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getReceiverId().equals(currentUser.getId())) {
            throw new SecurityException("Bạn không có quyền đánh dấu thông báo này");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByReceiverIdOrderByCreatedAtDesc(user.getId());
        for (Notification n : notifications) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(Long notificationId, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getReceiverId().equals(currentUser.getId())) {
            throw new SecurityException("Bạn không có quyền xoá thông báo này");
        }

        notificationRepository.deleteById(notificationId);
    }

    public void deleteFriendRequestNotification(User receiver, User sender) {
        Notification notification = notificationRepository.findBySenderIdAndReceiverIdAndType(sender.getId(), receiver.getId(), NotificationType.FRIEND_REQUEST);
        if (notification != null) {
            notificationRepository.delete(notification);
        }
    }
}
