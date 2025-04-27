import type React from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  Divider,
} from "@mui/material";
import {
  PersonAdd,
  PersonRemove,
  MoreVert,
  Block,
  Chat,
  CheckCircle,
  Cancel,
  Person,
} from "@mui/icons-material";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { FriendStatus } from "../../../types/friendship";

export interface FriendCardProps {
  id: number;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  mutualFriends?: number;
  status: FriendStatus;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onAdd?: (id: number) => void;
  onRemove?: (id: number) => void;
  onBlock?: (id: number) => void;
  onMessage?: (id: number) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  id,
  firstName,
  lastName,
  avatar,
  email,
  mutualFriends = 0,
  status,
  onAccept,
  onReject,
  onAdd,
  onRemove,
  onBlock,
  onMessage,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAction = (
    action:
      | "accept"
      | "reject"
      | "add"
      | "remove"
      | "block"
      | "message"
      | "cancel"
  ) => {
    handleCloseMenu();
    switch (action) {
      case "accept":
        onAccept?.(id);
        break;
      case "reject":
        onReject?.(id);
        break;
      case "add":
        onAdd?.(id);
        break;
      case "remove":
        onRemove?.(id);
        break;
      case "block":
        onBlock?.(id);
        break;
      case "message":
        onMessage?.(id);
        break;
    }
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Avatar
            src={avatar}
            alt={`${lastName} ${firstName}`}
            component={Link}
            to={`/profile/${email}`}
            sx={{
              width: 80,
              height: 80,
              mb: 1,
              cursor: "pointer",
              border: "2px solid",
              borderColor: "primary.light",
            }}
          />
          {status === "friend" && (
            <Tooltip title="Tùy chọn">
              <IconButton onClick={handleOpenMenu} size="small">
                <MoreVert />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Typography
          variant="h6"
          component={Link}
          to={`/profile/${email}`}
          sx={{
            textDecoration: "none",
            color: "text.primary",
            "&:hover": {
              color: "primary.main",
              textDecoration: "underline",
            },
          }}
        >
          {lastName} {firstName}
        </Typography>

        {mutualFriends > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 1, mb: 2 }}>
            <Person
              fontSize="small"
              sx={{ color: "text.secondary", mr: 0.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              {mutualFriends} bạn chung
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: "auto" }}>
          {status === "friend" && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Chat />}
                onClick={() => handleAction("message")}
                fullWidth
                size="small"
              >
                Nhắn tin
              </Button>
            </Box>
          )}

          {status === "request" && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => handleAction("accept")}
                fullWidth
                size="small"
              >
                Chấp nhận
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => handleAction("reject")}
                fullWidth
                size="small"
              >
                Từ chối
              </Button>
            </Box>
          )}

          {status === "suggestion" && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => handleAction("add")}
              fullWidth
              size="small"
            >
              Kết bạn
            </Button>
          )}

          {status === "sent" && (
            <Chip
              label="Đã gửi lời mời"
              color="primary"
              variant="outlined"
              onDelete={() => handleAction("cancel")}
              sx={{ width: "100%" }}
            />
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        onClick={handleCloseMenu}
      >
        <MenuItem onClick={() => handleAction("message")}>
          <Chat fontSize="small" sx={{ mr: 1 }} />
          Nhắn tin
        </MenuItem>
        <MenuItem onClick={() => handleAction("remove")}>
          <PersonRemove fontSize="small" sx={{ mr: 1 }} />
          Hủy kết bạn
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleAction("block")}
          sx={{ color: "error.main" }}
        >
          <Block fontSize="small" sx={{ mr: 1 }} />
          Chặn
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default FriendCard;
