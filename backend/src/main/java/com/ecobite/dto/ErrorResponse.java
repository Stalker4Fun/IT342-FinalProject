package com.ecobite.dto;

import java.util.Map;

public record ErrorResponse(
        String timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
    public ErrorResponse(int status, String error, String message, String path) {
        this(java.time.Instant.now().toString(), status, error, message, path, null);
    }

    public ErrorResponse(int status, String error, String message, String path, Map<String, String> fieldErrors) {
        this(java.time.Instant.now().toString(), status, error, message, path, fieldErrors);
    }
}
