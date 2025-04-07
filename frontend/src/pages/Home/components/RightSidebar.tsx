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
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { friendshipService } from "../../../services/friendshipService";
import { userService } from "../../../services/userService";

interface User {
  id: number;
  name: string;
  avatar?: string;
  mutualFriends?: number;
}

interface RightSidebarProps {
  className?: string;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ className }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingFriend, setAddingFriend] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const currentUserId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getSuggestedUsers();
        console.log("Users response:", response.data);
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
  }, []);

  const handleAddFriend = async (userId: number) => {
    try {
      setAddingFriend(userId);
      console.log("Sending friend request to user:", userId);
      const response = await friendshipService.sendFriendRequest(
        currentUserId,
        userId
      );
      console.log("Friend request response:", response.data);

      // Cập nhật lại danh sách sau khi gửi yêu cầu
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);

      setSnackbar({
        open: true,
        message: "Đã gửi lời mời kết bạn thành công!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      setSnackbar({
        open: true,
        message: "Có lỗi xảy ra khi gửi yêu cầu kết bạn",
        severity: "error",
      });
    } finally {
      setAddingFriend(null);
    }
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
                  user.mutualFriends
                    ? `${user.mutualFriends} bạn chung`
                    : undefined
                }
                sx={{
                  "& span": {
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                  maxWidth: "91px",
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

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
