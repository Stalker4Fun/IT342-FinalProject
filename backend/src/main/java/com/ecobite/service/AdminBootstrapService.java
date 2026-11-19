package com.ecobite.service;

import com.ecobite.entity.Role;
import com.ecobite.entity.User;
import com.ecobite.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBootstrapService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${ecobite.admin.name:EcoBite System Admin}")
    private String adminName;

    @Value("${ecobite.admin.email:admin@ecobite.org}")
    private String adminEmail;

    @Value("${ecobite.admin.password}")
    private String adminPassword;

    public AdminBootstrapService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(adminPassword)) {
            throw new IllegalStateException("ADMIN_PASSWORD must be configured in environment or .env file.");
        }

        long adminCount = userRepository.countByRole(Role.ADMIN);
        if (adminCount == 0) {
            String normalizedEmail = adminEmail.trim().toLowerCase();
            if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                log.info("Admin email already exists. Skipping bootstrap.");
                return;
            }

            User admin = new User(
                    adminName.trim(),
                    normalizedEmail,
                    passwordEncoder.encode(adminPassword.trim()),
                    Role.ADMIN,
                    "+639000000000",
                    "EcoBite HQ, Cebu City",
                    null,
                    null,
                    true
            );
            userRepository.save(admin);
            log.info("Bootstrapped initial Admin account: {}", normalizedEmail);
        } else {
            log.info("Admin account already exists in database. Skipping bootstrap.");
        }
    }
}
