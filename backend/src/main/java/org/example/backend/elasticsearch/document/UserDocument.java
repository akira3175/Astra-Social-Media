package org.example.backend.elasticsearch.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Document(indexName = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class UserDocument {

    @Id
    private String id;

    private String email;

    private String firstName;

    private String lastName;

    private String avatar;

    private String bio;

    private Boolean isStaff;

    private Boolean isSuperUser;

    private Boolean isActive;

    private String background;

    private Integer mutualFriends;

    @Field(type = FieldType.Text)
    private String fullName;

    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private ZonedDateTime lastLogin;

    @Field(type = FieldType.Date, format = DateFormat.date_time)
    private ZonedDateTime dateJoined;
}
