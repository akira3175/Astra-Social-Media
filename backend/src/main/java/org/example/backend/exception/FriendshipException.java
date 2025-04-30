package org.example.backend.exception;

public class FriendshipException extends RuntimeException {
    public FriendshipException(String message) {
        super(message);
    }

    public FriendshipException(String message, Throwable cause) {
        super(message, cause);
    }
}