package com.ecobite.service;

import com.ecobite.dto.*;
import com.ecobite.entity.Role;
import com.ecobite.entity.User;
import com.ecobite.exception.DuplicateEmailException;
import com.ecobite.exception.FieldValidationException;
import com.ecobite.exception.InvalidRequestException;
import com.ecobite.exception.ResourceNotFoundException;
import com.ecobite.repository.UserRepository;
import com.ecobite.security.CustomUserDetails;
import com.ecobite.security.JwtTokenProvider;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern PH_PHONE_PATTERN = Pattern.compile("^09\\d{9}$");
    private static final Pattern E164_PHONE_PATTERN = Pattern.compile("^\\+\\d{10,15}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenRevocationService tokenRevocationService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       TokenRevocationService tokenRevocationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenRevocationService = tokenRevocationService;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Validate and normalize role (strictly DONOR or RECIPIENT, block ADMIN escalation)
        String roleStr = request.role() != null ? request.role().trim().toUpperCase() : "";
        if ("ADMIN".equals(roleStr)) {
            throw new InvalidRequestException("Registration with role ADMIN is strictly prohibited.");
        }
        Role role;
        try {
            role = Role.valueOf(roleStr);
            if (role != Role.DONOR && role != Role.RECIPIENT) {
                throw new InvalidRequestException("Role must be either DONOR or RECIPIENT.");
            }
        } catch (IllegalArgumentException e) {
            throw new InvalidRequestException("Invalid role specified. Role must be either DONOR or RECIPIENT.");
        }

        String normalizedContact = normalizeAndValidateContact(request.contactNumber());
        validateCoordinates(request.latitude(), request.longitude());

        // Duplicate email prevention (case-insensitive check)
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateEmailException("An account with email " + normalizedEmail + " already exists.");
        }

        // BCrypt password hashing & verification status setup
        // Donors are auto-verified; Recipients require Admin verification (FR-001.2)
        boolean isVerified = (role == Role.DONOR);
        String passwordHash = passwordEncoder.encode(request.password());

        User user = new User(
                request.name().trim(),
                normalizedEmail,
                passwordHash,
                role,
                normalizedContact,
                request.address().trim(),
                request.latitude(),
                request.longitude(),
                isVerified
        );

        try {
            User savedUser = userRepository.saveAndFlush(user);
            return UserResponse.fromEntity(savedUser);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEmailException("An account with email " + normalizedEmail + " already exists.");
        }
    }

    public UserResponse getUserProfile(Long userId, CustomUserDetails principal) {
        enforceSelfOwnership(userId, principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUserProfile(Long userId, UpdateProfileRequest request, CustomUserDetails principal) {
        enforceSelfOwnership(userId, principal);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String normalizedContact = normalizeAndValidateContact(request.contactNumber());
        validateCoordinates(request.latitude(), request.longitude());

        String normalizedEmail = request.email().trim().toLowerCase();
        if (!normalizedEmail.equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateEmailException("An account with email " + normalizedEmail + " already exists.");
        }

        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setContactNumber(normalizedContact);
        user.setAddress(request.address().trim());
        user.setLatitude(request.latitude());
        user.setLongitude(request.longitude());

        try {
            User updated = userRepository.saveAndFlush(user);
            return UserResponse.fromEntity(updated);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateEmailException("An account with email " + normalizedEmail + " already exists.");
        }
    }

    private void enforceSelfOwnership(Long targetUserId, CustomUserDetails principal) {
        if (principal == null || !principal.getUserId().equals(targetUserId)) {
            throw new AccessDeniedException("You are only authorized to access or modify your own profile.");
        }
    }

    private String normalizeAndValidateContact(String contactNumber) {
        String rawContact = contactNumber != null ? contactNumber.trim() : "";
        if (PH_PHONE_PATTERN.matcher(rawContact).matches()) {
            return "+63" + rawContact.substring(1);
        }
        if (E164_PHONE_PATTERN.matcher(rawContact).matches()) {
            return rawContact;
        }
        throw new InvalidRequestException(
                "Contact number must be formatted as + followed by 10-15 digits, or Philippine format 09XXXXXXXXX."
        );
    }

    private void validateCoordinates(Float latitude, Float longitude) {
        if ((latitude != null && longitude == null) || (latitude == null && longitude != null)) {
            throw new InvalidRequestException("Both latitude and longitude must be provided, or both omitted.");
        }
        if (latitude != null) {
            if (latitude < -90.0f || latitude > 90.0f) {
                throw new InvalidRequestException("Latitude must be between -90 and 90 degrees.");
            }
            if (longitude < -180.0f || longitude > 180.0f) {
                throw new InvalidRequestException("Longitude must be between -180 and 180 degrees.");
            }
        }
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : "";

        // Spring Security AuthenticationManager authenticates with DaoAuthenticationProvider and BCrypt
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        // Generate JWT token with sub=userId, role, jti, iat, exp (respecting prior password invalidation timestamp)
        Instant invalidatedBefore = tokenRevocationService.getInvalidatedBefore(user.getUserId());
        String token = jwtTokenProvider.generateToken(user.getUserId(), user.getRole().name(), invalidatedBefore);
        long expiresIn = jwtTokenProvider.getExpirationSeconds();

        return new AuthResponse(token, expiresIn, UserResponse.fromEntity(user));
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, CustomUserDetails principal, String authHeader) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify current password (400 Bad Request, NOT 401, so client session-expired interceptor isn't triggered)
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidRequestException("Current password is incorrect.");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new FieldValidationException(
                    "New password and confirmation do not match.",
                    Map.of("confirmPassword", "Passwords do not match")
            );
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new FieldValidationException(
                    "New password must be different from your current password.",
                    Map.of("newPassword", "New password must be different from current password")
            );
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        // Revoke current JWT immediately and invalidate all prior active sessions
        logout(authHeader);
        tokenRevocationService.invalidateAllUserTokens(user);
    }

    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenProvider.validateToken(token)) {
                String jti = jwtTokenProvider.getJtiFromToken(token);
                Instant expiry = jwtTokenProvider.getExpirationFromToken(token);
                tokenRevocationService.revokeToken(jti, expiry);
            }
        }
    }

    public UserResponse getCurrentUser(CustomUserDetails principal) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.fromEntity(user);
    }

    public DashboardDonorResponse getDonorDashboard(CustomUserDetails principal) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String status = user.isVerified() ? "ACTIVE" : "PENDING";
        return new DashboardDonorResponse(
                "Welcome to the Donor Portal, " + user.getName() + "!",
                UserResponse.fromEntity(user),
                status
        );
    }

    public DashboardRecipientResponse getRecipientDashboard(CustomUserDetails principal) {
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String status = user.isVerified() ? "APPROVED" : "PENDING_APPROVAL";
        String message = user.isVerified()
                ? "Your recipient account is approved. You can claim surplus food listings."
                : "Awaiting admin approval. You can't claim food until your account is approved.";
        return new DashboardRecipientResponse(
                message,
                UserResponse.fromEntity(user),
                user.isVerified(),
                status
        );
    }

    public DashboardAdminResponse getAdminDashboard() {
        long totalUsers = userRepository.count();
        long totalDonors = userRepository.countByRole(Role.DONOR);
        long totalRecipients = userRepository.countByRole(Role.RECIPIENT);
        long pendingRecipients = userRepository.countByRoleAndIsVerified(Role.RECIPIENT, false);
        long approvedRecipients = userRepository.countByRoleAndIsVerified(Role.RECIPIENT, true);

        return new DashboardAdminResponse(
                totalUsers,
                totalDonors,
                totalRecipients,
                pendingRecipients,
                approvedRecipients
        );
    }

    public List<UserResponse> getRecipients(String status) {
        List<User> list;
        if ("pending".equalsIgnoreCase(status)) {
            list = userRepository.findByRoleAndIsVerified(Role.RECIPIENT, false);
        } else if ("approved".equalsIgnoreCase(status)) {
            list = userRepository.findByRoleAndIsVerified(Role.RECIPIENT, true);
        } else {
            list = userRepository.findByRole(Role.RECIPIENT);
        }
        return list.stream().map(UserResponse::fromEntity).toList();
    }

    @Transactional
    public UserResponse verifyRecipient(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() != Role.RECIPIENT) {
            throw new ResourceNotFoundException("User with id " + userId + " is not a Recipient.");
        }

        user.setVerified(true);
        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public UserResponse revokeRecipient(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getRole() != Role.RECIPIENT) {
            throw new ResourceNotFoundException("User with id " + userId + " is not a Recipient.");
        }

        user.setVerified(false);
        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }
}
