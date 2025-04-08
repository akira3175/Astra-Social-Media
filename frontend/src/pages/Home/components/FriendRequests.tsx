import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { friendshipService } from "../../../services/friendshipService";
import { useCurrentUser } from "../../../contexts/currentUserContext";

interface FriendRequest {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  receiver: {
    id: number;
    name: string;
    avatar?: string;
  };
  status: string;
  createdAt: string;
}

const FriendRequests: React.FC = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const data = await friendshipService.getFriendRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách lời mời kết bạn");
      console.error("Error fetching friend requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await friendshipService.acceptFriendRequest(requestId);
      // Cập nhật lại danh sách sau khi chấp nhận
      setRequests(requests.filter((request) => request.id !== requestId));
    } catch (err) {
      console.error("Error accepting friend request:", err);
      setError("Không thể chấp nhận lời mời kết bạn");
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await friendshipService.rejectFriendRequest(requestId);
      // Cập nhật lại danh sách sau khi từ chối
      setRequests(requests.filter((request) => request.id !== requestId));
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      setError("Không thể từ chối lời mời kết bạn");
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, textAlign: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (requests.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body1" color="textSecondary" align="center">
          Không có lời mời kết bạn nào
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lời mời kết bạn
      </Typography>
      <List>
        {requests.map((request) => (
          <ListItem key={request.id}>
            <ListItemAvatar>
              <Avatar src={request.sender.avatar} alt={request.sender.name} />
            </ListItemAvatar>
            <ListItemText
              primary={request.sender.name}
              secondary={`Gửi lời mời kết bạn vào ${new Date(
                request.createdAt
              ).toLocaleDateString()}`}
            />
            <ListItemSecondaryAction>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => handleAccept(request.id)}
                sx={{ mr: 1 }}
              >
                Chấp nhận
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleReject(request.id)}
              >
                Từ chối
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default FriendRequests;
