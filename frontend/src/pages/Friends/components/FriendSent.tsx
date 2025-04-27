import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  CircularProgress,
  Paper,
  Button,
} from "@mui/material";
import { PersonRemove } from "@mui/icons-material";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";
import { Link } from "react-router-dom";

interface SentRequest {
  id: number;
  status: string;
  createdAt: string;
  receiver: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    name: string;
    mutualFriends: number | null;
  };
}

const FriendSent: React.FC = () => {
  const [requests, setRequests] = useState<SentRequest[]>([]);
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
      const data = await friendshipService.getSentRequests(currentUser!.id);
      setRequests(data);
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
      await friendshipService.rejectFriendRequest(requestId);
      setRequests(requests.filter((request) => request.id !== requestId));
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
                  src={request.receiver.avatar || ""}
                  alt={request.receiver.name}
                  sx={{ width: 56, height: 56, mr: 2 }}
                >
                  {request.receiver.firstName.charAt(0)}
                  {request.receiver.lastName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    component={Link}
                    to={`/profile/${request.receiver.email}`}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {request.receiver.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.receiver.email}
                  </Typography>
                  {request.receiver.mutualFriends !== null && (
                    <Typography variant="body2" color="text.secondary">
                      {request.receiver.mutualFriends} bạn chung
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
