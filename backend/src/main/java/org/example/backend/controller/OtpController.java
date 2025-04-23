package org.example.backend.controller;

import org.example.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/otp")
public class OtpController {

    @Autowired
    private OtpService otpService;

    @PostMapping("/send")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        otpService.sendOtpToEmail(email);
        return ResponseEntity.ok("OTP đã được gửi tới email.");
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean valid = otpService.verifyOtp(email, otp);
        if (valid) {
            return ResponseEntity.ok("Xác minh thành công.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã OTP không hợp lệ hoặc đã hết hạn.");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> requestOtp(@RequestParam String email) {
        otpService.sendOtpToEmail(email);
        return ResponseEntity.ok("OTP đã được gửi đến email của bạn.");
    }
}
