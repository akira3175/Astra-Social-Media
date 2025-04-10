package org.example.backend.exception;

public enum ErrorCode {
    UNCATEGORIZED(999, "Uncategorized error"),
    USER_NOT_FOUND(405, "User not found"),
    INVALID_CREDENTIALS(401, "Invalid credentials"),
    UNAUTHORIZED(401, "Unauthorized"),
    FORBIDDEN(403, "Forbidden"),
    INTERNAL_SERVER_ERROR(500, "Internal server error");

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
