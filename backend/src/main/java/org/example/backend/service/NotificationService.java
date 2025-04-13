package org.example.backend.service;

import org.example.backend.dto.NotificationDTO;
import org.example.backend.entity.Notification;
import org.example.backend.entity.NotificationType;
import org.example.backend.entity.User;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    UserRepository userRepository;

    private String generateMessage(NotificationType type, String senderName) {
        return switch (type) {
            case LIKE -> senderName + " đã thích bài viết của bạn";
            case COMMENT -> senderName + " đã bình luận bài viết của bạn";
            case SHARE -> senderName + " đã chia sẻ bài viết của bạn";
            case POST -> senderName + " đã đăng bài mới";
        };
    }

    public NotificationDTO toDTO(Notification noti) {
        User sender = userRepository.findById(noti.getSenderId()).orElseThrow();
        String message = generateMessage(noti.getType(), sender.getLastName() + sender.getFirstName());

        return new NotificationDTO(
                noti.getId(),
                sender.getId(),
                sender.getLastName() + sender.getFirstName(),
                noti.getType(),
                noti.getPostId(),
                message,
                noti.getIsRead(),
                noti.getCreatedAt()
        );
    }
}
