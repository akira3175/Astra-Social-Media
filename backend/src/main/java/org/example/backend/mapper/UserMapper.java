package org.example.backend.mapper;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.User;

public class UserMapper {
    public static UserDTO toDTO(User user) {
        if (user == null) return null;

        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatar(user.getAvatar())
                .background(user.getBackground())
                .bio(user.getBio())
                .build();
    }
}
