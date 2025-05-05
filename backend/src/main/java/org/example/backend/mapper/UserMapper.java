package org.example.backend.mapper;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.User;
import org.example.backend.elasticsearch.document.UserDocument;
import java.time.ZonedDateTime;
import java.time.ZoneId;


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

    public UserDocument toDocument(User user) {
        UserDocument userDocument = new UserDocument();
        userDocument.setId(user.getId().toString());
        userDocument.setEmail(user.getEmail());
        userDocument.setFirstName(user.getFirstName());
        userDocument.setLastName(user.getLastName());
        userDocument.setAvatar(user.getAvatar());
        userDocument.setBio(user.getBio());
        userDocument.setIsStaff(user.getIsStaff());
        userDocument.setIsSuperUser(user.getIsSuperUser());
        userDocument.setIsActive(user.getIsActive());
        userDocument.setBackground(user.getBackground());
        userDocument.setMutualFriends(user.getMutualFriends());
        userDocument.setFullName(userDocument.getLastName() + " " + userDocument.getFirstName());

        ZonedDateTime zonedDateTime;
        if (user.getLastLogin() == null) {
            zonedDateTime = null;
        } else {
            zonedDateTime = user.getLastLogin().atZone(ZoneId.of("UTC"));
        }
        userDocument.setLastLogin(zonedDateTime);

        zonedDateTime = user.getDateJoined().atZone(ZoneId.of("UTC"));
        userDocument.setDateJoined(zonedDateTime);

        return userDocument;
    }
}
