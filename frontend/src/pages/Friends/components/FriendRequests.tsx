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
import { Check, Close, PersonAdd } from "@mui/icons-material";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";
import { Link } from "react-router-dom";
import type { FriendRequest } from "../../../types/friendship";

const FriendRequests: React.FC = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      loadFriendRequests();
    }
  }, [currentUser?.id]);

  const loadFriendRequests = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getPendingRequests(currentUser!.id);
      console.log("Dữ liệu lời mời kết bạn:", data);

      const formattedData = data
        .filter((request: FriendRequest) => request.status === "PENDING")
        .map((request: FriendRequest) => {
          console.log("Request data:", request);
          console.log("Avatar URL:", request.user1.avatar);
          console.log("User1 data:", request.user1);

          return {
            ...request,
            sender: request.user1,
            user1: {
              ...request.user1,
              avatar: request.user1.avatar
                ? `http://localhost:8080${request.user1.avatar}`
                : "",
            },
          };
        });
      setRequests(formattedData);
      setError(null);
    } catch (error) {
      console.error("Lỗi khi tải lời mời kết bạn:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Không thể tải danh sách lời mời kết bạn");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi người dùng chấp nhận lời mời kết bạn
  const handleAccept = async (
    friendshipId: number,
    user1Id: number,
    user2Id: number
  ) => {
    try {
      // 1. Thêm cả hai người dùng vào bảng friend trước
      await friendshipService.addFriend(user1Id, user2Id);

      // 2. Sau đó mới cập nhật trạng thái
      await friendshipService.acceptFriendRequest(friendshipId);

      // 3. Cập nhật lại danh sách sau khi chấp nhận
      setRequests(requests.filter((request) => request.id !== friendshipId));

      // 4. Hiển thị thông báo thành công
      alert("Đã chấp nhận lời mời kết bạn thành công!");
    } catch (error) {
      // Kiểm tra nếu lỗi là do đã tồn tại trong bảng friend
      if (error instanceof Error && error.message.includes("đã tồn tại")) {
        // Nếu đã tồn tại trong bảng friend, chỉ cần cập nhật trạng thái
        try {
          await friendshipService.acceptFriendRequest(friendshipId);
          setRequests(
            requests.filter((request) => request.id !== friendshipId)
          );
          alert("Đã chấp nhận lời mời kết bạn thành công!");
        } catch (innerError) {
          console.error("Lỗi khi cập nhật trạng thái:", innerError);
          alert("Đã xảy ra lỗi khi cập nhật trạng thái kết bạn");
        }
      } else {
        console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
        alert("Đã xảy ra lỗi khi chấp nhận lời mời kết bạn");
      }
      // Nếu có lỗi, reload lại danh sách để đảm bảo trạng thái chính xác
      loadFriendRequests();
    }
  };

  // Hàm xử lý khi người dùng từ chối lời mời kết bạn
  const handleReject = async (friendshipId: number, currentUserId: number) => {
    try {
      await friendshipService.rejectFriendRequest(friendshipId, currentUserId);
      // Cập nhật lại danh sách sau khi từ chối
      setRequests(requests.filter((request) => request.id !== friendshipId));
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
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
      {/* Header hiển thị số lượng lời mời kết bạn */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <PersonAdd sx={{ mr: 1 }} />
          Lời mời kết bạn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {requests.length} lời mời đang chờ xác nhận
        </Typography>
      </Paper>

      {/* Hiển thị thông báo khi không có lời mời nào */}
      {requests.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            Không có lời mời kết bạn nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn sẽ nhận được thông báo khi có người gửi lời mời kết bạn.
          </Typography>
        </Box>
      ) : (
        // Hiển thị danh sách lời mời kết bạn
        <Grid container spacing={3}>
          {requests.map((request) => {
            console.log("Rendering request:", request);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={request.id}>
                <Card>
                  <CardContent>
                    {/* Thông tin người gửi lời mời */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar
                        src={request.user1.avatar}
                        alt={request.user1.name}
                        sx={{ width: 56, height: 56, mr: 2 }}
                      >
                        {!request.user1.avatar && (
                          <>
                            {request.user1.firstName?.charAt(0)}
                            {request.user1.lastName?.charAt(0)}
                          </>
                        )}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          component={Link}
                          to={`/profile/${request.user1.email}`}
                          sx={{
                            textDecoration: "none",
                            color: "inherit",
                            "&:hover": {
                              color: "primary.main",
                            },
                          }}
                        >
                          {request.user1.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {request.user1.email}
                        </Typography>
                        {request.user1.mutualFriends !== null && (
                          <Typography variant="body2" color="text.secondary">
                            {request.user1.mutualFriends} bạn chung
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {/* Thời gian gửi lời mời */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Đã gửi lời mời kết bạn vào{" "}
                      {new Date(request.createdAt).toLocaleString()}
                    </Typography>
                    {/* Các nút chấp nhận và từ chối */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Check />}
                        onClick={() =>
                          handleAccept(
                            request.id,
                            request.user1.id,
                            request.user2.id
                          )
                        }
                        fullWidth
                      >
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() =>
                          handleReject(request.id, currentUser!.id)
                        }
                        fullWidth
                      >
                        Từ chối
                      </Button>
                    </Box>
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

export default FriendRequests;
