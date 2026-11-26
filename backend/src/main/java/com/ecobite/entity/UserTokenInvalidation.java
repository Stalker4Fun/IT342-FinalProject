package com.ecobite.entity;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Tracks the timestamp before which all previously issued JWTs for a user are considered invalid.
 * Used to invalidate active sessions immediately upon password change or reset without altering the users table.
 */
@Entity
@Table(name = "user_token_invalidations")
public class UserTokenInvalidation {

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", insertable = false, updatable = false)
    private User user;

    @Column(name = "invalidated_before", nullable = false)
    private Instant invalidatedBefore;

    public UserTokenInvalidation() {
    }

    public UserTokenInvalidation(Long userId, Instant invalidatedBefore) {
        this.userId = userId;
        this.invalidatedBefore = invalidatedBefore;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public Instant getInvalidatedBefore() {
        return invalidatedBefore;
    }

    public void setInvalidatedBefore(Instant invalidatedBefore) {
        this.invalidatedBefore = invalidatedBefore;
    }
}
