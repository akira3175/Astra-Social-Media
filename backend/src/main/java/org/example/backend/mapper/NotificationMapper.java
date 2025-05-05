package org.example.backend.mapper;

import org.example.backend.dto.NotificationDTO;
import org.example.backend.entity.Notification;
import org.example.backend.entity.User;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.example.backend.repository.UserRepository;
import org.example.backend.entity.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    private final UserRepository userRepository;

    public NotificationMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String generateMessage(NotificationType type, String senderName) {
        return switch (type) {
            case LIKE -> senderName + " đã thích bài viết của bạn";
            case COMMENT -> senderName + " đã bình luận bài viết của bạn";
            case SHARE -> senderName + " đã chia sẻ bài viết của bạn";
            case POST -> senderName + " đã đăng bài mới";
            case COMMENT_LIKE -> senderName + " đã thích bình luận của bạn";
            case COMMENT_REPLY -> senderName + " đã trả lời bình luận của bạn";
            case FRIEND_REQUEST -> senderName + " đã gửi lời mời kết bạn";
        };
    }

    public NotificationDTO toDTO(Notification noti) {
        User sender = userRepository.findById(noti.getSenderId()).orElseThrow();
        String message = generateMessage(noti.getType(), sender.getLastName() + " " + sender.getFirstName());
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
                sender.getLastName() + " " + sender.getFirstName(),
                sender.getEmail(),
                avatarUrl,
                noti.getType(),
                noti.getPostId(),
                message,
                noti.getIsRead(),
                noti.getCreatedAt()
        );
    }
}
