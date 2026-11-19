package com.ecobite.dto;

import com.ecobite.entity.User;

public record UserResponse(
        Long userId,
        String name,
        String email,
        String role,
        String contactNumber,
        String address,
        Float latitude,
        Float longitude,
        boolean isVerified
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getContactNumber(),
                user.getAddress(),
                user.getLatitude(),
                user.getLongitude(),
                user.isVerified()
        );
    }
}
