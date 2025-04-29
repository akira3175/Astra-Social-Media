package org.example.backend.dto;

public class FriendStatusUpdateDTO {
    private String friendEmail;
    private boolean isOnline;

    public FriendStatusUpdateDTO(String friendEmail, boolean isOnline) {
        this.friendEmail = friendEmail;
        this.isOnline = isOnline;
    }

    // getters and setters
}
