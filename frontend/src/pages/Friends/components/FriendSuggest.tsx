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
import { PersonAdd } from "@mui/icons-material";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";
import { Link } from "react-router-dom";

// Interface định nghĩa cấu trúc dữ liệu của một người dùng gợi ý
interface SuggestedUser {
  id: number; // ID của người dùng
  firstName: string; // Tên
  lastName: string; // Họ
  email: string; // Email
  avatar: string; // URL ảnh đại diện
  mutualFriends: number | null; // Số bạn chung
}

const FriendSuggest: React.FC = () => {
  // State quản lý danh sách người dùng gợi ý
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);
  // State quản lý thông báo lỗi
  const [error, setError] = useState<string | null>(null);
  // Lấy thông tin người dùng hiện tại
  const { currentUser } = useCurrentUser();

  // Load danh sách gợi ý kết bạn khi component được mount hoặc currentUser thay đổi
  useEffect(() => {
    if (currentUser?.id) {
      loadSuggestedUsers();
    }
  }, [currentUser?.id]);

  // Hàm load danh sách người dùng gợi ý từ API
  const loadSuggestedUsers = async () => {
    try {
      setLoading(true);
      // Gọi API để lấy danh sách người dùng gợi ý
      const data = await friendshipService.getSuggestedUsers(currentUser!.id);
      console.log("Dữ liệu người dùng gợi ý:", data);

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

  // Hàm xử lý khi người dùng gửi lời mời kết bạn
  const handleSendRequest = async (userId: number) => {
    try {
      // Gửi lời mời kết bạn
      await friendshipService.sendFriendRequest(userId);

      // Hiển thị thông báo thành công
      alert("Đã gửi lời mời kết bạn thành công!");

      // Cập nhật lại danh sách sau khi gửi lời mời
      setSuggestedUsers(suggestedUsers.filter((user) => user.id !== userId));
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Đã xảy ra lỗi khi gửi lời mời kết bạn");
      }
    }
  };

  // Hiển thị loading spinner khi đang tải dữ liệu
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Hiển thị thông báo lỗi nếu có
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header hiển thị số lượng gợi ý */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <PersonAdd sx={{ mr: 1 }} />
          Gợi ý kết bạn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {suggestedUsers.length} người dùng có thể bạn biết
        </Typography>
      </Paper>

      {/* Hiển thị thông báo khi không có gợi ý nào */}
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
        // Hiển thị danh sách gợi ý kết bạn
        <Grid container spacing={3}>
          {suggestedUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
              <Card>
                <CardContent>
                  {/* Thông tin người dùng */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={user.avatar || ""}
                      alt={`${user.firstName} ${user.lastName}`}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    >
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
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
                  {/* Nút gửi lời mời kết bạn */}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAdd />}
                    onClick={() => handleSendRequest(user.id)}
                    fullWidth
                  >
                    Kết bạn
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default FriendSuggest;
