import type React from "react"
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
} from "@mui/material"

interface SuggestedUser {
  id: number
  name: string
  avatar: string
  mutualFriends: number
}

interface RightSidebarProps {
  className?: string
}

// Giả lập dữ liệu người dùng được đề xuất
const SUGGESTED_USERS: SuggestedUser[] = [
  {
    id: 201,
    name: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/150?img=10",
    mutualFriends: 5,
  },
  {
    id: 202,
    name: "Hoàng Văn E",
    avatar: "https://i.pravatar.cc/150?img=11",
    mutualFriends: 2,
  },
  {
    id: 203,
    name: "Vũ Thị F",
    avatar: "https://i.pravatar.cc/150?img=12",
    mutualFriends: 8,
  },
  {
    id: 204,
    name: "Nguyễn Văn G",
    avatar: "https://i.pravatar.cc/150?img=13",
    mutualFriends: 3,
  },
  {
    id: 205,
    name: "Trần Thị H",
    avatar: "https://i.pravatar.cc/150?img=14",
    mutualFriends: 6,
  },
  {
    id: 206,
    name: "Lê Văn I",
    avatar: "https://i.pravatar.cc/150?img=15",
    mutualFriends: 4,
  },
]

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
]

const RightSidebar: React.FC<RightSidebarProps> = ({ className }) => {
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
        {SUGGESTED_USERS.map((user) => (
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
            <ListItemAvatar sx={{ minWidth: "42px"}}>
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
                      maxWidth: "91px"
                  }}/>
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
          <Typography variant="caption" color="text.secondary" component="span" sx={{ mr: 1 }}>
            Giới thiệu
          </Typography>
          <Typography variant="caption" color="text.secondary" component="span" sx={{ mr: 1 }}>
            Điều khoản
          </Typography>
          <Typography variant="caption" color="text.secondary" component="span">
            Quyền riêng tư
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default RightSidebar

