package org.example.backend.repository;

import org.example.backend.entity.Friend;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    // Tìm tất cả bạn bè của một người dùng
    @Query("SELECT f FROM Friend f WHERE f.user.id = :userId OR f.friend.id = :userId")
    List<Friend> findAllFriends(@Param("userId") Long userId);

    // Kiểm tra xem hai người dùng có phải là bạn bè không
    @Query("SELECT COUNT(f) > 0 FROM Friend f WHERE " +
            "(f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
            "(f.user.id = :userId2 AND f.friend.id = :userId1)")
    boolean areFriends(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Xóa mối quan hệ bạn bè
    @Query("DELETE FROM Friend f WHERE " +
            "(f.user.id = :userId1 AND f.friend.id = :userId2) OR " +
            "(f.user.id = :userId2 AND f.friend.id = :userId1)")
    void deleteFriendship(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}