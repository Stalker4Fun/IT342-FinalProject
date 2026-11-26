package com.ecobite.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    @Value("${ecobite.jwt.secret}")
    private String jwtSecret;

    @Value("${ecobite.jwt.expiration-minutes:60}")
    private long expirationMinutes;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.trim().length() < 32) {
            throw new IllegalStateException("JWT_SECRET must be configured and contain at least 32 characters (256 bits).");
        }
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Long userId, String role) {
        return generateToken(userId, role, null);
    }

    public String generateToken(Long userId, String role, Instant invalidatedBefore) {
        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();
        // JWT iat is second-precision; if re-logging in within the same second as a token invalidation,
        // advance iat to the next whole second so the newly issued token is strictly after invalidatedBefore.
        Instant iat = now.truncatedTo(ChronoUnit.SECONDS);
        if (invalidatedBefore != null && !iat.isAfter(invalidatedBefore)) {
            iat = Instant.ofEpochSecond(invalidatedBefore.getEpochSecond() + 1);
        }
        Instant expiry = iat.plus(expirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .id(jti)
                .issuedAt(Date.from(iat))
                .expiration(Date.from(expiry))
                .signWith(secretKey)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = getClaims(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getRoleFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.get("role", String.class);
    }

    public String getJtiFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.getId();
    }

    public Instant getIssuedAtFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.getIssuedAt() != null ? claims.getIssuedAt().toInstant() : null;
    }

    public Instant getExpirationFromToken(String token) {
        Claims claims = getClaims(token);
        return claims.getExpiration().toInstant();
    }

    public long getExpirationMinutes() {
        return expirationMinutes;
    }

    public long getExpirationSeconds() {
        return expirationMinutes * 60;
    }
}
