import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  CircularProgress,
  Alert as MuiAlert,
  Snackbar,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import InfoIcon from "@mui/icons-material/Info";
import { userService } from "../../../services/userService";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import { friendshipService } from "../../../services/friendshipService";

interface User {
  id: number;
  name: string;
  avatar?: string;
  mutualFriends?: number;
  status?: string;
  friendshipStatus?: string;
  isUser1?: boolean;
  friendshipId?: number;
}

interface RightSidebarProps {
  className?: string;
}

interface ApiError {
  message: string;
  status?: number;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ className }) => {
  const { currentUser } = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingFriend, setAddingFriend] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        if (!currentUser?.id) {
          throw new Error("Không tìm thấy thông tin người dùng");
        }
        const response = await userService.getSuggestedUsers(currentUser.id);
        console.log("Suggested users response:", response.data);
        setUsers(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Có lỗi xảy ra khi tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleAddFriend = async (userId: number) => {
    if (!currentUser?.id) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để thực hiện chức năng này",
        severity: "error",
      });
      return;
    }

    try {
      setAddingFriend(userId);
      console.log("Sending friend request to user:", userId);
      console.log("Current user ID:", currentUser.id);

      // Kiểm tra xem người dùng có tồn tại không
      const userToAdd = users.find((user) => user.id === userId);
      if (!userToAdd) {
        throw new Error("Không tìm thấy người dùng");
      }

      // Kiểm tra token trước khi gửi request
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }
      console.log("Using token:", token);

      // Kiểm tra xem token có phải là access token không
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Token không hợp lệ");
      }

      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log("Token payload:", payload);
        if (payload.type !== "access") {
          throw new Error("Token không phải là access token");
        }
      } catch (e) {
        console.error("Error parsing token:", e);
        throw new Error("Token không hợp lệ");
      }

      // Gửi request trực tiếp thay vì qua service
      const response = await fetch(
        `http://localhost:8080/api/friends/request?userId1=${currentUser.id}&userId2=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        let errorMessage = "Có lỗi xảy ra khi gửi yêu cầu kết bạn";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }

      // Kiểm tra xem response có body không
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          const data = await response.json();
          console.log("Friend request response:", data);
        } catch (e) {
          console.error("Error parsing success response:", e);
        }
      }

      // Cập nhật lại danh sách sau khi gửi yêu cầu
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);

      setSnackbar({
        open: true,
        message: `Đã gửi lời mời kết bạn đến ${userToAdd.name} thành công!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      const apiError = error as ApiError;
      setSnackbar({
        open: true,
        message: apiError.message || "Có lỗi xảy ra khi gửi yêu cầu kết bạn",
        severity: "error",
      });
    } finally {
      setAddingFriend(null);
    }
  };

  const handleAcceptFriend = async (user: User) => {
    if (!currentUser?.id) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để thực hiện chức năng này",
        severity: "error",
      });
      return;
    }

    console.log("User object for accepting friend request:", user);
    console.log("Friendship ID:", user.friendshipId);

    if (!user.friendshipId) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy thông tin lời mời kết bạn",
        severity: "error",
      });
      return;
    }

    try {
      setAddingFriend(user.id);
      console.log("Calling accept friend request API...");
      const response = await friendshipService.acceptFriendRequest(
        user.friendshipId
      );
      console.log("Accept friend request response:", response);
      setUsers(users.filter((u) => u.id !== user.id));
      setSnackbar({
        open: true,
        message: "Đã chấp nhận lời mời kết bạn",
        severity: "success",
      });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      const apiError = error as ApiError;
      setSnackbar({
        open: true,
        message:
          apiError.message || "Có lỗi xảy ra khi chấp nhận lời mời kết bạn",
        severity: "error",
      });
    } finally {
      setAddingFriend(null);
    }
  };

  const handleRejectFriend = async (user: User) => {
    if (!currentUser?.id) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để thực hiện chức năng này",
        severity: "error",
      });
      return;
    }

    console.log("User object for rejecting friend request:", user);
    console.log("Friendship ID:", user.friendshipId);

    if (!user.friendshipId) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy thông tin lời mời kết bạn",
        severity: "error",
      });
      return;
    }

    try {
      setAddingFriend(user.id);
      console.log("Calling reject friend request API...");
      const response = await friendshipService.rejectFriendRequest(
        user.friendshipId
      );
      console.log("Reject friend request response:", response);
      setUsers(users.filter((u) => u.id !== user.id));
      setSnackbar({
        open: true,
        message: "Đã từ chối lời mời kết bạn",
        severity: "success",
      });
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      const apiError = error as ApiError;
      setSnackbar({
        open: true,
        message:
          apiError.message || "Có lỗi xảy ra khi từ chối lời mời kết bạn",
        severity: "error",
      });
    } finally {
      setAddingFriend(null);
    }
  };

  const handleUserInfo = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseUserInfo = () => {
    setSelectedUser(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Paper className={className} sx={{ p: 2, textAlign: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper className={className} sx={{ p: 2 }}>
        <MuiAlert severity="error">{error}</MuiAlert>
      </Paper>
    );
  }

  return (
    <>
      <Paper
        className={className}
        sx={{
          p: 2,
          height: "auto",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Gợi ý kết bạn
        </Typography>
        <List disablePadding>
          {users.map((user) => (
            <ListItem
              key={user.id}
              secondaryAction={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Tooltip title="Xem thông tin">
                    <IconButton
                      size="small"
                      onClick={() => handleUserInfo(user)}
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  {user.friendshipStatus === "ACCEPTED" ? (
                    <Button
                      variant="outlined"
                      color="success"
                      size="small"
                      disabled
                      startIcon={<PersonAddIcon />}
                    >
                      Bạn bè
                    </Button>
                  ) : user.friendshipStatus === "PENDING" ? (
                    user.isUser1 ? (
                      <Button
                        variant="outlined"
                        color="warning"
                        size="small"
                        disabled
                        startIcon={<PersonAddIcon />}
                      >
                        Đã gửi lời mời
                      </Button>
                    ) : (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleAcceptFriend(user)}
                          startIcon={<PersonAddIcon />}
                        >
                          Chấp nhận
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleRejectFriend(user)}
                        >
                          Từ chối
                        </Button>
                      </div>
                    )
                  ) : user.friendshipStatus === "REJECTED" ? (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled
                      startIcon={<PersonAddIcon />}
                    >
                      Đã từ chối
                    </Button>
                  ) : user.friendshipStatus === "BLOCKED" ? (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled
                      startIcon={<PersonAddIcon />}
                    >
                      Đã chặn
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleAddFriend(user.id)}
                      disabled={addingFriend === user.id}
                      startIcon={
                        addingFriend === user.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <PersonAddIcon />
                        )
                      }
                    >
                      {addingFriend === user.id ? "" : "Kết bạn"}
                    </Button>
                  )}
                </div>
              }
              disablePadding
              sx={{ mb: 2 }}
            >
              <ListItemAvatar sx={{ minWidth: "42px" }}>
                <Avatar src={user.avatar} />
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={
                  <>
                    {user.mutualFriends
                      ? `${user.mutualFriends} bạn chung`
                      : "Chưa có bạn chung"}
                    {user.status && ` • ${user.status}`}
                  </>
                }
                sx={{
                  "& span": {
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  maxWidth: "150px",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Dialog
        open={!!selectedUser}
        onClose={handleCloseUserInfo}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>Thông tin người dùng</DialogTitle>
            <DialogContent>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <Avatar
                  src={selectedUser.avatar}
                  sx={{ width: 64, height: 64 }}
                />
                <div>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography color="textSecondary">
                    {selectedUser.mutualFriends
                      ? `${selectedUser.mutualFriends} bạn chung`
                      : "Chưa có bạn chung"}
                  </Typography>
                  {selectedUser.status && (
                    <Typography color="textSecondary">
                      Trạng thái: {selectedUser.status}
                    </Typography>
                  )}
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseUserInfo}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </>
  );
};

export default RightSidebar;
