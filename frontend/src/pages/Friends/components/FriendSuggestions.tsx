import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  Avatar,
  Paper,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import axios from "axios";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";

interface SuggestedUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  mutualFriends: number;
}

const FriendSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentUser?.id) {
        console.log("No current user ID");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/users/suggestions`,
          {
            params: {
              currentUserId: currentUser.id,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        console.log("API Response:", response.data);

        if (Array.isArray(response.data)) {
          setSuggestions(response.data);
        } else {
          console.error("Invalid response format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        if (axios.isAxiosError(error)) {
          console.error("Error details:", {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentUser?.id]);

  const handleAddFriend = async (user: SuggestedUser) => {
    try {
      await friendshipService.sendFriendRequest(user.email);
      console.log("Friend request sent successfully");

      // Cập nhật lại danh sách gợi ý
      setSuggestions(
        suggestions.filter((suggestion) => suggestion.id !== user.id)
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
      if (error instanceof Error) {
        if (error.message.includes("đăng nhập lại")) {
          // Nếu token hết hạn, chuyển hướng về trang đăng nhập
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        } else {
          alert(error.message);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography variant="h6" color="text.secondary">
          Không có gợi ý kết bạn nào
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {suggestions.map((user) => {
        console.log("Rendering user:", user);
        return (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Paper
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 80, height: 80, mb: 2 }}
              />
              <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {user.mutualFriends} bạn chung
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleAddFriend(user)}
                fullWidth
              >
                Kết bạn
              </Button>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default FriendSuggestions;
