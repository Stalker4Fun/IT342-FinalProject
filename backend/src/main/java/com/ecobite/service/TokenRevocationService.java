package com.ecobite.service;

import com.ecobite.entity.RevokedToken;
import com.ecobite.entity.User;
import com.ecobite.entity.UserTokenInvalidation;
import com.ecobite.repository.RevokedTokenRepository;
import com.ecobite.repository.UserTokenInvalidationRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class TokenRevocationService {

    private final RevokedTokenRepository revokedTokenRepository;
    private final UserTokenInvalidationRepository userTokenInvalidationRepository;

    public TokenRevocationService(RevokedTokenRepository revokedTokenRepository,
                                  UserTokenInvalidationRepository userTokenInvalidationRepository) {
        this.revokedTokenRepository = revokedTokenRepository;
        this.userTokenInvalidationRepository = userTokenInvalidationRepository;
    }

    @Transactional
    public void revokeToken(String jti, Instant expiresAt) {
        if (jti != null && expiresAt != null) {
            revokedTokenRepository.save(new RevokedToken(jti, expiresAt));
        }
    }

    @Transactional
    public void invalidateAllUserTokens(User user) {
        Instant now = Instant.now();
        UserTokenInvalidation invalidation = userTokenInvalidationRepository.findById(user.getUserId())
                .orElseGet(() -> new UserTokenInvalidation(user.getUserId(), now));
        invalidation.setInvalidatedBefore(now);
        userTokenInvalidationRepository.save(invalidation);
    }

    public Instant getInvalidatedBefore(Long userId) {
        Optional<UserTokenInvalidation> opt = userTokenInvalidationRepository.findById(userId);
        return opt.map(UserTokenInvalidation::getInvalidatedBefore).orElse(null);
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void purgeExpiredTokens() {
        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
