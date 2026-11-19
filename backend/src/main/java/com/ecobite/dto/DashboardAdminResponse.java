package com.ecobite.dto;

public record DashboardAdminResponse(
        long totalUsers,
        long totalDonors,
        long totalRecipients,
        long pendingRecipients,
        long approvedRecipients
) {
}
