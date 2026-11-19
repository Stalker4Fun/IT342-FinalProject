package com.ecobite.controller;

import com.ecobite.dto.DashboardRecipientResponse;
import com.ecobite.security.CustomUserDetails;
import com.ecobite.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recipient")
@PreAuthorize("hasRole('RECIPIENT')")
public class RecipientController {

    private final UserService userService;

    public RecipientController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardRecipientResponse> getDashboard(@AuthenticationPrincipal CustomUserDetails principal) {
        DashboardRecipientResponse response = userService.getRecipientDashboard(principal);
        return ResponseEntity.ok(response);
    }
}
