import type React from "react"
import { Link } from "react-router-dom"
import { Button, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper } from "@mui/material"
import { Chat, Explore, Home as HomeIcon, Notifications, Person, Settings } from "@mui/icons-material"

interface MenuItem {
  text: string
  icon: React.ReactNode
  path: string
  active?: boolean
}

interface LeftSidebarProps {
  className?: string
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ className }) => {
  // Danh sách menu chính
  const mainMenuItems: MenuItem[] = [
    { text: "Trang chủ", icon: <HomeIcon />, path: "/", active: true },
    { text: "Khám phá", icon: <Explore />, path: "/explore" },
    { text: "Thông báo", icon: <Notifications />, path: "/notifications" },
    { text: "Tin nhắn", icon: <Chat />, path: "/messages" },
    { text: "Cài đặt", icon: <Settings />, path: "/settings" },
  ]

  // Thêm nhiều mục menu để test scroll
  const additionalMenuItems: MenuItem[] = [
    { text: "Bạn bè", icon: <Person />, path: "/friends" },
    { text: "Nhóm", icon: <Person />, path: "/groups" },
    { text: "Sự kiện", icon: <Person />, path: "/events" },
    { text: "Đã lưu", icon: <Person />, path: "/saved" },
    { text: "Kỷ niệm", icon: <Person />, path: "/memories" },
    { text: "Marketplace", icon: <Person />, path: "/marketplace" },
    { text: "Video", icon: <Person />, path: "/videos" },
    { text: "Trò chơi", icon: <Person />, path: "/games" },
  ]

  return (
    <Paper
      className={className}
      sx={{
        p: 2,
        height: "auto",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <List>
        {mainMenuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: item.active ? "rgba(79, 70, 229, 0.1)" : "transparent",
                color: item.active ? "#4f46e5" : "inherit",
                "&:hover": {
                  bgcolor: "rgba(79, 70, 229, 0.05)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: item.active ? "#4f46e5" : "inherit",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Button
        variant="contained"
        fullWidth
        component={Link}
        to="/create-post"
        sx={{
          bgcolor: "#4f46e5",
          "&:hover": { bgcolor: "#4338ca" },
          textTransform: "none",
          py: 1.5,
        }}
      >
        Tạo bài viết
      </Button>

      <Divider sx={{ my: 2 }} />
      <List>
        {additionalMenuItems.map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&:hover": {
                  bgcolor: "rgba(79, 70, 229, 0.05)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default LeftSidebar

