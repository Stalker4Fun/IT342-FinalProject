package com.ecobite.security;

import com.ecobite.entity.User;
import com.ecobite.entity.UserTokenInvalidation;
import com.ecobite.repository.RevokedTokenRepository;
import com.ecobite.repository.UserRepository;
import com.ecobite.repository.UserTokenInvalidationRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final RevokedTokenRepository revokedTokenRepository;
    private final UserRepository userRepository;
    private final UserTokenInvalidationRepository userTokenInvalidationRepository;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider,
                                   RevokedTokenRepository revokedTokenRepository,
                                   UserRepository userRepository,
                                   UserTokenInvalidationRepository userTokenInvalidationRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.revokedTokenRepository = revokedTokenRepository;
        this.userRepository = userRepository;
        this.userTokenInvalidationRepository = userTokenInvalidationRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String token = extractToken(request);

        if (StringUtils.hasText(token) && jwtTokenProvider.validateToken(token)) {
            String jti = jwtTokenProvider.getJtiFromToken(token);

            // Reject if token was revoked upon logout or password change
            if (!revokedTokenRepository.existsById(jti)) {
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                Instant issuedAt = jwtTokenProvider.getIssuedAtFromToken(token);

                // Reject if token was issued before the user's last password change/reset
                boolean invalidatedByPasswordUpdate = false;
                Optional<UserTokenInvalidation> invalidationOpt = userTokenInvalidationRepository.findById(userId);
                if (invalidationOpt.isPresent()) {
                    Instant invalidatedBefore = invalidationOpt.get().getInvalidatedBefore();
                    if (issuedAt == null || !issuedAt.isAfter(invalidatedBefore)) {
                        invalidatedByPasswordUpdate = true;
                    }
                }

                if (!invalidatedByPasswordUpdate) {
                    Optional<User> userOptional = userRepository.findById(userId);

                    if (userOptional.isPresent()) {
                        CustomUserDetails userDetails = new CustomUserDetails(userOptional.get());
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    public static String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
