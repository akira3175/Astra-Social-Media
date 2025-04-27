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
    public String generateAccessToken(String email) {
        try {
            return Jwts.builder()
                    .subject(email)
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION_TIME))
                    .claim("type", "access")
                    .signWith(SECRET_KEY)
                    .compact();
        } catch (Exception e) {
            throw new RuntimeException("Error generating access token: " + e.getMessage());
        }
    }

    // Tạo Refresh Token
    public String generateRefreshToken(String email) {
        try {
            String token = Jwts.builder()
                    .subject(email)
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION_TIME))
                    .claim("type", "refresh")
                    .signWith(SECRET_KEY)
                    .compact();

            RefreshToken refreshToken = RefreshToken.builder()
                    .token(token)
                    .email(email)
                    .expiryDate(Instant.now().plusMillis(REFRESH_EXPIRATION_TIME))
                    .build();

            refreshTokenRepository.save(refreshToken);
            return token;
        } catch (Exception e) {
            throw new RuntimeException("Error generating refresh token: " + e.getMessage());
        }
    }

    // Lấy email từ token
    public String extractEmail(String token) {
        try {
            return getClaims(token).getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Error extracting email from token: " + e.getMessage());
        }
    }

    // Kiểm tra token có hợp lệ không
    public boolean isTokenValid(String token, String email) {
        try {
            return extractEmail(token).equals(email) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        try {
            Claims claims = getClaims(token);
            return "access".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            Claims claims = getClaims(token);
            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }

    // Lấy thông tin từ token
    private Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(SECRET_KEY)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new RuntimeException("Error parsing token: " + e.getMessage());
        }
    }

    // Kiểm tra token có hết hạn không
    private boolean isTokenExpired(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }
}
