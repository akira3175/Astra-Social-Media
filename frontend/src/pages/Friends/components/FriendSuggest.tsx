import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Paper,
} from "@mui/material";
import { PersonAdd, PersonRemove } from "@mui/icons-material";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";
import { Link } from "react-router-dom";
import { User } from "../../../types/user";

const FriendSuggest: React.FC = () => {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      loadSuggestedUsers();
    }
  }, [currentUser?.id]);

  const loadSuggestedUsers = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getSuggestedUsers(currentUser!.id);
      setSuggestedUsers(data);
      setError(null);
    } catch (error) {
      console.error("Lỗi khi tải danh sách gợi ý:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Không thể tải danh sách gợi ý kết bạn");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (email: string) => {
    try {
      await friendshipService.sendFriendRequest(email);
      // Thêm email vào danh sách chờ thay vì xóa khỏi danh sách gợi ý
      setPendingRequests(prev => new Set(prev).add(email));
      alert("Đã gửi lời mời kết bạn thành công!");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Đã xảy ra lỗi khi gửi lời mời kết bạn");
      }
    }
  };

  const handleCancelRequest = async (email: string) => {
    try {
      // Giả sử bạn có API để hủy yêu cầu kết bạn
      await friendshipService.cancelFriendRequest(email);
      // Xóa email khỏi danh sách chờ
      setPendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
      alert("Đã hủy lời mời kết bạn!");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Đã xảy ra lỗi khi hủy lời mời kết bạn");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <PersonAdd sx={{ mr: 1 }} />
          Gợi ý kết bạn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {suggestedUsers.length} người dùng có thể bạn biết
        </Typography>
      </Paper>

      {suggestedUsers.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            Không có gợi ý kết bạn nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy thử tìm kiếm người dùng khác hoặc mời bạn bè tham gia.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {suggestedUsers.map((user) => {
            const isPending = pendingRequests.has(user.email);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={user.avatar || ""}
                        alt={`${user.firstName} ${user.lastName}`}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      >
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          component={Link}
                          to={`/profile/${user.email}`}
                          sx={{
                            textDecoration: "none",
                            color: "inherit",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.mutualFriends !== null && (
                          <Typography variant="body2" color="text.secondary">
                            {user.mutualFriends} bạn chung
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {isPending ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<PersonRemove />}
                        onClick={() => handleCancelRequest(user.email)}
                        fullWidth
                      >
                        Hủy
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PersonAdd />}
                        onClick={() => handleSendRequest(user.email)}
                        fullWidth
                      >
                        Kết bạn
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default FriendSuggest;