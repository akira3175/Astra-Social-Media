package org.example.backend.exception;

public class FriendshipException extends RuntimeException {

    private int errorCode;

    // Constructor with message only
    public FriendshipException(String message) {
        super(message);
    }

    // Constructor with message and errorCode
    public FriendshipException(String message, int errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    // Constructor with message, cause, and errorCode
    public FriendshipException(String message, Throwable cause, int errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    // Getter for errorCode
    public int getErrorCode() {
        return errorCode;
    }
}
