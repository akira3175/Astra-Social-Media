import type React from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { useCurrentUser } from "../../../contexts/currentUserContext";

interface User {
  id: number;
  name: string;
  avatar: string;
  mutualFriends: number;
  friendshipStatus?: string;
  isUser1?: boolean;
  friendshipId?: number;
}

interface SuggestedUserResponse {
  id: number;
  name: string;
  avatar: string;
  mutualFriends: number;
  friendshipStatus?: string;
  isUser1?: boolean;
  friendshipId?: number;
}

interface RightSidebarProps {
  className?: string;
}

// Thêm nhiều xu hướng để test scroll
const TRENDING_TOPICS = [
  "#TinMới",
  "#CôngNghệ",
  "#DuLịch",
  "#ẨmThực",
  "#ThểThao",
  "#GiảiTrí",
  "#KhoaHọc",
  "#SứcKhỏe",
  "#GiáoDục",
  "#KinhTế",
];

const RightSidebar: React.FC<RightSidebarProps> = ({ className }) => {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!currentUser?.id) {
        console.log("No current user ID found");
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        console.log("Fetching suggested users for user ID:", currentUser.id);
        console.log("Using token:", token);

        const response = await axios.get<SuggestedUserResponse[]>(
          `http://localhost:8080/api/users/suggestions?currentUserId=${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("API Response status:", response.status);
        console.log("API Response data:", response.data);

        if (!response.data || !Array.isArray(response.data)) {
          console.error("Invalid response format:", response.data);
          return;
        }

        if (response.data.length === 0) {
          console.log("No suggested users found");
          return;
        }

        setSuggestedUsers(
          response.data.map((user) => {
            console.log("Processing user:", user);
            return {
              id: user.id,
              name: user.name,
              avatar: user.avatar || "",
              mutualFriends: user.mutualFriends || 0,
              friendshipStatus: user.friendshipStatus,
              isUser1: user.isUser1,
              friendshipId: user.friendshipId,
            };
          })
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
          });
        } else {
          console.error("Unknown error:", error);
        }
      }
    };

    fetchSuggestedUsers();
  }, [currentUser?.id]);

  return (
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
        {suggestedUsers.map((user) => (
          <ListItem
            key={user.id}
            secondaryAction={
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#4f46e5",
                  color: "#4f46e5",
                  "&:hover": {
                    borderColor: "#4338ca",
                    bgcolor: "rgba(79, 70, 229, 0.05)",
                  },
                  textTransform: "none",
                }}
              >
                Kết bạn
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
              secondary={`${user.mutualFriends} bạn chung`}
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
      <Divider sx={{ my: 2 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        Xu hướng
      </Typography>
      <List disablePadding>
        {TRENDING_TOPICS.map((tag, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton sx={{ borderRadius: 1 }}>
              <ListItemText primary={tag} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 AstraSocial
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="span"
            sx={{ mr: 1 }}
          >
            Giới thiệu
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            component="span"
            sx={{ mr: 1 }}
          >
            Điều khoản
          </Typography>
          <Typography variant="caption" color="text.secondary" component="span">
            Quyền riêng tư
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RightSidebar;
