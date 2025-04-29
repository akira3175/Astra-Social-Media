import type React from "react";
import {
  Avatar,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../contexts/currentUserContext";
import friendshipService from "../../../services/friendshipService";

interface Friend {
  id: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  friend: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
  };
  since: string;
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
  const [friends, setFriends] = useState<Friend[]>([]);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser?.id) {
        console.log("No current user ID found");
        return;
      }

      try {
        const data = await friendshipService.getFriends(currentUser.id);
        // Format lại đường dẫn avatar
        const formattedData = data.map((friend: Friend) => ({
          ...friend,
          user: {
            ...friend.user,
            avatar: friend.user.avatar
              ? `http://localhost:8080${friend.user.avatar}`
              : "",
          },
          friend: {
            ...friend.friend,
            avatar: friend.friend.avatar
              ? `http://localhost:8080${friend.friend.avatar}`
              : "",
          },
        }));
        setFriends(formattedData);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
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
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Bạn bè
      </Typography>
      <List disablePadding>
        {friends.map((friend) => {
          const friendUser =
            friend.user.id === currentUser?.id ? friend.friend : friend.user;
          return (
            <ListItem
              key={friend.id}
              disablePadding
              sx={{
                mb: 2,
                p: 1,
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemAvatar sx={{ minWidth: "48px" }}>
                <Avatar
                  src={friendUser.avatar || ""}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "2px solid #e0e0e0",
                    bgcolor: "#e0e0e0",
                  }}
                >
                  {!friendUser.avatar &&
                    `${friendUser.firstName.charAt(
                      0
                    )}${friendUser.lastName.charAt(0)}`}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 500,
                      color: "#1a1a1a",
                    }}
                  >
                    {`${friendUser.firstName} ${friendUser.lastName}`}
                  </Typography>
                }
                sx={{
                  ml: 1,
                  "& span": {
                    display: "block",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ my: 2 }} />
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
