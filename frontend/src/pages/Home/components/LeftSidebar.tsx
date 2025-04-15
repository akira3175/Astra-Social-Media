import type React from "react"
import { Link } from "react-router-dom"
import { Button, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper } from "@mui/material"
import { Chat, Explore, Home as HomeIcon, Notifications, Person, Settings } from "@mui/icons-material"
import { useState, useEffect } from "react"
import { useCurrentUser } from "../../../contexts/currentUserContext"

interface MenuItem {
  text: string
  icon: React.ReactNode
  path: string
  active?: boolean
  onClick?: () => void
}

interface ChatUser {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
}

interface LeftSidebarProps {
  className?: string
  onToggleChat: () => void
  setSelectedReceiverId?: (id: string) => void
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ className, onToggleChat, setSelectedReceiverId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [, setChatUsers] = useState<ChatUser[]>([])
  const { currentUser } = useCurrentUser()

  const loadChatUsers = () => {
    if (!currentUser?.id) return

    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.log('User not logged in, redirecting to login page')
      window.location.href = '/login'
      return
    }

    fetch(`http://localhost:8080/api/chat/users/${currentUser.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('accessToken')
            window.location.href = '/login'
          }
          throw new Error('Network response was not ok')
        }
        return res.json()
      })
      .then(data => {
        console.log("Loaded chat users:", data)
        setChatUsers(data)
        // Nếu có người dùng và có setSelectedReceiverId, chọn người đầu tiên
        if (data.length > 0 && setSelectedReceiverId) {
          setSelectedReceiverId(data[0].id)
        }
      })
      .catch(error => {
        console.error('Error fetching chat users:', error)
      })
  }

  useEffect(() => {
    if (isChatOpen && currentUser?.id) {
      loadChatUsers()
    }
  }, [isChatOpen, currentUser?.id])

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
    onToggleChat()
    if (!isChatOpen) {
      loadChatUsers()
    }
  }

  // Danh sách menu chính
  const mainMenuItems: MenuItem[] = [
    { text: "Trang chủ", icon: <HomeIcon />, path: "/", active: true },
    { text: "Khám phá", icon: <Explore />, path: "/explore" },
    { text: "Thông báo", icon: <Notifications />, path: "/notifications" },
    {
      text: "Tin nhắn",
      icon: <Chat />,
      path: "/messages",
      onClick: toggleChat
    },
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
              component={item.onClick ? "button" : Link}
              to={!item.onClick ? item.path : undefined}
              onClick={item.onClick}
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

