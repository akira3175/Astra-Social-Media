package org.example.backend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.*; // Import EqualsAndHashCode and ToString
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import java.util.ArrayList; // Import ArrayList
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"post", "user", "parentComment", "replies", "likes", "images"}) // Exclude recursive fields
@EqualsAndHashCode(exclude = {"post", "user", "parentComment", "replies", "likes", "images"}) // Exclude recursive fields
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @JsonBackReference // Thêm annotation này
    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonBackReference("comment-replies") // Unique name for this back reference
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // Initialize replies list
    @JsonManagedReference("comment-replies") // Matches the back reference name
    private List<Comment> replies = new ArrayList<>();

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdAt;

    @Column
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // Initialize likes list
    private List<Like> likes = new ArrayList<>();

    @JsonManagedReference("comment-images") // Unique name for this managed reference
    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default // Initialize images list
    private List<Image> images = new ArrayList<>();
}
