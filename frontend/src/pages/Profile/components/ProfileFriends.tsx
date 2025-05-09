import type React from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import friendshipService from "../../../services/friendshipService";
import { Friendship } from "../../../types/friendship";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import { api } from "../../../configs/api";
import { User } from "../../../types/user";

interface ProfileFriendsProps {
  userEmail?: string;
  userId?: number;
}

const ProfileFriends: React.FC<ProfileFriendsProps> = ({
  userEmail,
  userId,
}) => {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { email } = useParams<{ email: string }>();
  const targetEmail = userEmail || email;
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (!targetEmail && !userId) {
      setError("Không tìm thấy thông tin người dùng");
      setLoading(false);
      return;
    }

    // Reset state khi email hoặc userId thay đổi
    setFriends([]);
    setError(null);
    setLoading(true);

    loadFriends(targetEmail, userId);
  }, [targetEmail, userId]);

  const loadFriends = async (email?: string, id?: number) => {
    try {
      setLoading(true);
      let data;
      if (id) {
        data = await friendshipService.getFriendsByUserId(id);
      } else if (email) {
        // Luôn lấy danh sách bạn bè theo email
        data = await friendshipService.getFriendsByEmail(email);
      } else {
        throw new Error("Thiếu thông tin người dùng");
      }

      // Lọc và map danh sách bạn bè dựa trên vai trò người gửi/nhận
      const viewedProfileId = userId || id;

      if (!Array.isArray(data)) {
        console.error("Data is not an array:", data);
        setFriends([]);
        return;
      }

      const filteredFriends = (data as unknown as Friendship[])
        .map((friendship) => {
          if (!friendship.user) {
            return null;
          }

          // Nếu user trong friendship trùng với viewedProfileId
          if (friendship.user.id === viewedProfileId) {
            // Gọi API để lấy thông tin người bạn
            return api
              .get(
                `/friendships/${friendship.id}/other-user?userId=${viewedProfileId}`
              )
              .then((response: { data: User }) => {
                return {
                  ...friendship,
                  user: response.data,
                };
              })
              .catch((error) => {
                console.error("Error getting friend info:", error);
                return null;
              });
          }

          // Nếu user trong friendship khác với viewedProfileId
          // thì đây chính là thông tin người bạn cần hiển thị
          return Promise.resolve({
            ...friendship,
            user: friendship.user,
          });
        })
        .filter((friendship) => friendship !== null); // Lọc bỏ các friendship null

      // Đợi tất cả các promise hoàn thành
      const finalFriends = await Promise.all(filteredFriends);

      // Lọc bỏ các friendship null
      const validFriends = finalFriends.filter((friend) => friend !== null);

      setFriends(validFriends);
      setError(null);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bạn bè:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setError("Không tìm thấy người dùng");
        } else if (error.response?.status === 401) {
          setError("Phiên đăng nhập đã hết hạn");
          navigate("/login");
        } else {
          setError(
            error.response?.data?.message || "Lỗi khi tải danh sách bạn bè"
          );
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Không thể tải danh sách bạn bè");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    if (targetEmail) {
      navigate(`/friends?user=${targetEmail}`);
    } else if (userId) {
      navigate(`/friends?userId=${userId}`);
    } else {
      navigate("/friends");
    }
  };

  const handleFriendClick = (friend: Friendship) => {
    navigate(`/profile/${friend.user.email}`);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Bạn bè</Typography>
        {currentUser?.email === targetEmail && (
          <Button
            size="small"
            sx={{
              textTransform: "none",
              outline: "none",
              "&:focus": { outline: "none" },
            }}
            onClick={handleViewAll}
          >
            Xem tất cả
          </Button>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {friends.length} bạn bè
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : friends.length === 0 ? (
        <Box sx={{ textAlign: "center", p: 2 }}>
          <Typography color="text.secondary">Chưa có bạn bè</Typography>
        </Box>
      ) : (
        <Grid container spacing={0.5}>
          {friends.slice(0, 9).map((friend) => (
            <Grid item xs={4} key={friend.id}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 0.5,
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
                onClick={() => handleFriendClick(friend)}
              >
                <Box
                  sx={{
                    width: "100%",
                    paddingTop: "100%",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 1,
                    mb: 0.5,
                  }}
                >
                  <Avatar
                    src={friend.user.avatar}
                    alt={`${friend.user.firstName} ${friend.user.lastName}`}
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </Box>
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {`${friend.user.firstName} ${friend.user.lastName}`}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default ProfileFriends;
