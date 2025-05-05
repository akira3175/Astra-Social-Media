package org.example.backend.service;

import org.example.backend.entity.OtpVerification;
import org.example.backend.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpVerificationRepository otpRepo;
    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpToEmail(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpVerification otpRecord = new OtpVerification();
        otpRecord.setEmail(email);
        otpRecord.setOtp(otp);
        otpRecord.setExpirationTime(LocalDateTime.now().plusMinutes(5));
        otpRecord.setUsed(false);
        otpRepo.save(otpRecord);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Mã xác thực OTP");
        message.setText("Mã OTP của bạn là: " + otp);
        mailSender.send(message);
    }

    public boolean verifyOtp(String email, String otp) {
        Optional<OtpVerification> optional = otpRepo.findByEmailAndOtpAndUsedFalse(email, otp);
        if (optional.isPresent()) {
            OtpVerification record = optional.get();
            if (record.getExpirationTime().isAfter(LocalDateTime.now())) {
                record.setUsed(true);
                otpRepo.save(record);
                return true;
            }
        }
        return false;
    }
}
