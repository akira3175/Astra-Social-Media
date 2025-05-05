package org.example.backend.elasticsearch.document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.example.backend.dto.UserDTO;
import org.example.backend.entity.Comment;
import org.example.backend.entity.Image;
import org.example.backend.entity.Like;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.DateFormat;


import java.util.Date;
import java.util.List;


@Document(indexName = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDocument {

    @Id
    private String id;  // ES sử dụng String làm ID

    @Field(type = FieldType.Text)
    private String content;

    @Field(type = FieldType.Object)
    private List<Image> images;

    @Field(type = FieldType.Keyword)
    private String userId;  // Lưu userId thay vì object User

    @Field(type = FieldType.Date, format = DateFormat.date_time, pattern = "yyyy-MM-dd HH:mm:ss.SSS")
    private Date createdAt;

    @Field(type = FieldType.Date, format = DateFormat.date_time, pattern = "yyyy-MM-dd HH:mm:ss.SSS")
    private Date updatedAt;

    @Field(type = FieldType.Keyword)
    private String originalPostId;  // Lưu originalPostId thay vì Post

    @Field(type = FieldType.Object)
    private List<Comment> comments;

    @Field(type = FieldType.Object)
    private List<Like> likes;

    @Field(type = FieldType.Boolean)
    private boolean isDeleted;

    @Field(type = FieldType.Date, format = DateFormat.date_time, pattern = "yyyy-MM-dd HH:mm:ss.SSS")
    private String deletedAt;

    @Field(type = FieldType.Boolean)
    private boolean likedByCurrentUser;

    @Field(type = FieldType.Integer)
    private long likeCount;

    @Field(type = FieldType.Integer)
    private long totalCommentCount;

    public void setIsDeleted(boolean deleted) {
    }
}
