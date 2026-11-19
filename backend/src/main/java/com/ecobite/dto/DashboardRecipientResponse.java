package com.ecobite.dto;

public record DashboardRecipientResponse(
        String message,
        UserResponse user,
        boolean isVerified,
        String status
) {
}
