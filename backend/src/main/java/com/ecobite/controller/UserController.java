package com.ecobite.controller;

import com.ecobite.dto.UpdateProfileRequest;
import com.ecobite.dto.UserResponse;
import com.ecobite.security.CustomUserDetails;
import com.ecobite.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('DONOR', 'RECIPIENT', 'ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    @PreAuthorize("#userId == authentication.principal.userId")
    public ResponseEntity<UserResponse> getProfile(
            @PathVariable("userId") Long userId,
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(userService.getUserProfile(userId, principal));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("#userId == authentication.principal.userId")
    public ResponseEntity<UserResponse> updateProfile(
            @PathVariable("userId") Long userId,
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(userService.updateUserProfile(userId, request, principal));
    }
}
