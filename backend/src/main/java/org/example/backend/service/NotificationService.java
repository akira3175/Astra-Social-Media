package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.NotificationDTO;
import org.example.backend.entity.Notification;
import org.example.backend.entity.NotificationType;
import org.example.backend.entity.Post;
import org.example.backend.entity.User;
import org.example.backend.repository.NotificationRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.example.backend.entity.Comment;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;

    private String generateMessage(NotificationType type, String senderName) {
        return switch (type) {
            case LIKE -> senderName + " đã thích bài viết của bạn";
            case COMMENT -> senderName + " đã bình luận bài viết của bạn";
            case SHARE -> senderName + " đã chia sẻ bài viết của bạn";
            case POST -> senderName + " đã đăng bài mới";
            case COMMENT_LIKE -> senderName + " đã thích bình luận của bạn";
            case COMMENT_REPLY -> senderName + " đã trả lời bình luận của bạn";
        };
    }

    public NotificationDTO toDTO(Notification noti) {
        User sender = userRepository.findById(noti.getSenderId()).orElseThrow();
        String message = generateMessage(noti.getType(), sender.getLastName() + sender.getFirstName());
        String avatarUrl = null;
        if (sender.getAvatar() != null) {
            avatarUrl = ServletUriComponentsBuilder
                    .fromCurrentContextPath()
                    .path(sender.getAvatar())
                    .toUriString();
        }

        return new NotificationDTO(
                noti.getId(),
                sender.getId(),
                sender.getLastName() + " " +sender.getFirstName(),
                avatarUrl,
                noti.getType(),
                noti.getPostId(),
                message,
                noti.getIsRead(),
                noti.getCreatedAt()
        );
    }

    public void sendToUser(String email, Notification notification) {
        NotificationDTO dto = toDTO(notification);
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
}
