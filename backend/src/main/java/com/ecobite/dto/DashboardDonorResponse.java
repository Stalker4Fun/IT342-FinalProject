package com.ecobite.dto;

public record DashboardDonorResponse(
        String message,
        UserResponse user,
        String accountStatus
) {
}
