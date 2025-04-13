package org.example.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "images")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url; // Lưu đường dẫn ảnh (ví dụ: link từ S3, Firebase)

    @JsonBackReference // Thêm annotation này
    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Post post;

    @JsonBackReference // Thêm annotation này
    @ManyToOne
    @JoinColumn(name = "comment_id")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Comment comment;
}
