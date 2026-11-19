package com.ecobite.repository;

import com.ecobite.entity.Role;
import com.ecobite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    long countByRole(Role role);
    long countByRoleAndIsVerified(Role role, boolean isVerified);
    List<User> findByRole(Role role);
    List<User> findByRoleAndIsVerified(Role role, boolean isVerified);
}
