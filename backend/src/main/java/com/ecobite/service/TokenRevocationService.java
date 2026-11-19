package com.ecobite.service;

import com.ecobite.entity.RevokedToken;
import com.ecobite.repository.RevokedTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;

    public TokenRevocationService(RevokedTokenRepository revokedTokenRepository) {
        this.revokedTokenRepository = revokedTokenRepository;
    }

    @Transactional
    public void revokeToken(String jti, Instant expiresAt) {
        if (jti != null && expiresAt != null) {
            revokedTokenRepository.save(new RevokedToken(jti, expiresAt));
        }
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void purgeExpiredTokens() {
        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
