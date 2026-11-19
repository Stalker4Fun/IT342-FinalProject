package com.ecobite.controller;

import com.ecobite.dto.DashboardAdminResponse;
import com.ecobite.dto.UserResponse;
import com.ecobite.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    public AdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAdminResponse> getDashboard() {
        DashboardAdminResponse response = userService.getAdminDashboard();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recipients")
    public ResponseEntity<List<UserResponse>> getRecipients(@RequestParam(value = "status", defaultValue = "all") String status) {
        List<UserResponse> list = userService.getRecipients(status);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/recipients/{userId}/verify")
    public ResponseEntity<UserResponse> verifyRecipient(@PathVariable("userId") Long userId) {
        UserResponse response = userService.verifyRecipient(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/recipients/{userId}/revoke")
    public ResponseEntity<UserResponse> revokeRecipient(@PathVariable("userId") Long userId) {
        UserResponse response = userService.revokeRecipient(userId);
        return ResponseEntity.ok(response);
    }
}
