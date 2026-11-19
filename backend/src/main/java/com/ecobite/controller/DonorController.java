package com.ecobite.controller;

import com.ecobite.dto.DashboardDonorResponse;
import com.ecobite.security.CustomUserDetails;
import com.ecobite.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donor")
@PreAuthorize("hasRole('DONOR')")
public class DonorController {

    private final UserService userService;

    public DonorController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDonorResponse> getDashboard(@AuthenticationPrincipal CustomUserDetails principal) {
        DashboardDonorResponse response = userService.getDonorDashboard(principal);
        return ResponseEntity.ok(response);
    }
}
