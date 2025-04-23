package org.example.backend.service;

import org.example.backend.entity.PasswordResetToken;
import org.example.backend.entity.User;
import org.example.backend.repository.PasswordResetTokenRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {
    @Autowired
    private PasswordResetTokenRepository tokenRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void sendPasswordResetToken(String email) {
        Optional<User> optionalUser = userRepo.findByEmail(email);
        if (optionalUser.isEmpty()) return;

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(30);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setEmail(email);
        resetToken.setToken(token);
        resetToken.setExpiration(expiry);
        resetToken.setUsed(false);
        tokenRepo.save(resetToken);

        String link = "https://astrasocial.netlify.app/reset-password?token=" + token;
        String subject = "Đặt lại mật khẩu";
        String content = "Nhấn vào liên kết sau để đặt lại mật khẩu:\n" + link;

        sendEmail(email, subject, content);
    }

    public boolean verifyToken(String token) {
        Optional<PasswordResetToken> optional = tokenRepo.findByTokenAndUsedFalse(token);
        return optional.isPresent() && optional.get().getExpiration().isAfter(LocalDateTime.now());
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> optional = tokenRepo.findByTokenAndUsedFalse(token);
        if (optional.isEmpty()) return false;

        PasswordResetToken resetToken = optional.get();
        if (resetToken.getExpiration().isBefore(LocalDateTime.now())) return false;

        Optional<User> userOptional = userRepo.findByEmail(resetToken.getEmail());
        if (userOptional.isEmpty()) return false;

        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true);
        tokenRepo.save(resetToken);

        return true;
    }

    private void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }
}

