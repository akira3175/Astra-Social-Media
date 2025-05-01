import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  CircularProgress,
  Button,
} from "@mui/material";
import { PersonRemove } from "@mui/icons-material";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";
import { Link } from "react-router-dom";
import { Friendship } from "../../../types/friendship";

const FriendSent: React.FC = () => {
  const [requests, setRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      loadSentRequests();
    }
  }, [currentUser?.id]);

  const loadSentRequests = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getSentFriendRequests();
      setRequests(data as unknown as Friendship[]);
      setError(null);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lời mời đã gửi:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Không thể tải danh sách lời mời đã gửi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      if (!currentUser?.id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Tìm request cần hủy
      const request = requests.find((r) => r.id === requestId);
      if (!request) {
        throw new Error("Không tìm thấy lời mời kết bạn");
      }

      // Gọi API hủy lời mời
      await friendshipService.cancelFriendRequest(request.user.email);

      // Cập nhật lại danh sách
      setRequests(requests.filter((r) => r.id !== requestId));
      alert("Đã hủy lời mời kết bạn thành công!");
    } catch (error) {
      console.error("Lỗi khi hủy lời mời:", error);
      if (error instanceof Error) {
        alert(error.message);
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
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Bạn chưa gửi lời mời kết bạn nào
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {requests.map((request) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={request.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={request.user.avatar || ""}
                  alt={`${request.user.firstName} ${request.user.lastName}`}
                  sx={{ width: 56, height: 56, mr: 2 }}
                >
                  {request.user.firstName?.charAt(0)}
                  {request.user.lastName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    component={Link}
                    to={`/profile/${request.user.email}`}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {`${request.user.lastName} ${request.user.firstName}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.user.email}
                  </Typography>
                  {request.user.mutualFriends !== undefined && (
                    <Typography variant="body2" color="text.secondary">
                      {request.user.mutualFriends} bạn chung
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PersonRemove />}
                  onClick={() => handleCancelRequest(request.id)}
                >
                  Hủy lời mời
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FriendSent;
