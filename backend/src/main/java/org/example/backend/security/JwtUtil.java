package org.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.RequiredArgsConstructor;
import org.example.backend.entity.RefreshToken;
import org.example.backend.repository.RefreshTokenRepository;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {
    private final SecretKey SECRET_KEY = Jwts.SIG.HS256.key().build();
    private final long ACCESS_EXPIRATION_TIME = 900000; // 15 phút
    private final long REFRESH_EXPIRATION_TIME = 604800000; // 7 ngày
    private final RefreshTokenRepository refreshTokenRepository;

    // Tạo Access Token
    public String generateAccessToken(String email, Long userId) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION_TIME))
                .claim("type", "access")
                .claim("userId", userId)
                .signWith(SECRET_KEY)
                .compact();
    }

    // Tạo Refresh Token
    public String generateRefreshToken(String email, Long userId) {
        String token = Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION_TIME))
                .claim("type", "refresh")
                .claim("userId", userId)
                .signWith(SECRET_KEY)
                .compact();

        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .email(email)
                .expiryDate(Instant.now().plusMillis(REFRESH_EXPIRATION_TIME))
                .build();

        refreshTokenRepository.save(refreshToken);
        return token;
    }

    // Lấy email từ token
    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Lấy userId từ token
    public Long extractUserId(String token) {
        Claims claims = getClaims(token);
        return claims.get("userId", Long.class);
    }

    // Kiểm tra token có hợp lệ không
    public boolean isTokenValid(String token, String email) {
        return extractEmail(token).equals(email) && !isTokenExpired(token);
    }

    public boolean isAccessToken(String token) {
        Claims claims = getClaims(token);
        return "access".equals(claims.get("type"));
    }

    public boolean isRefreshToken(String token) {
        Claims claims = getClaims(token);
        return "refresh".equals(claims.get("type"));
    }

    // Lấy thông tin từ token
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Kiểm tra token có hết hạn không
    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }
}
