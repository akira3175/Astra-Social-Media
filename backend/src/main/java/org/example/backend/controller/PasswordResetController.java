package org.example.backend.controller;

import org.example.backend.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/password")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        passwordResetService.sendPasswordResetToken(email);
        return ResponseEntity.ok("Đã gửi email đặt lại mật khẩu nếu tài khoản tồn tại.");
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        boolean isValid = passwordResetService.verifyToken(token);
        return isValid
                ? ResponseEntity.ok("Token hợp lệ.")
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token không hợp lệ hoặc đã hết hạn.");
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");

        boolean success = passwordResetService.resetPassword(token, newPassword);
        return success
                ? ResponseEntity.ok("Đặt lại mật khẩu thành công.")
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Token không hợp lệ hoặc đã hết hạn.");
    }
}
