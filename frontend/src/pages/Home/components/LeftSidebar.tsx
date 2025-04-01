import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Badge, Button, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Menu, MenuItem } from "@mui/material"
import { Chat, Explore, Home as HomeIcon, Notifications, Person, Settings } from "@mui/icons-material"
import ChatBox from "../../../components/ChatBox/ChatBox"

interface MenuItem {
  text: string
  icon: React.ReactNode
  path: string
  active?: boolean
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  badge?: number
}

interface LeftSidebarProps {
  className?: string
  currentUserId: number
  onToggleChat: () => void
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ className, currentUserId, onToggleChat }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedReceiverId, setSelectedReceiverId] = useState("default-receiver")
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch("/api/friendships/pending")
      const data = await response.json()
      setPendingRequests(data)
    } catch (error) {
      console.error("Error fetching pending requests:", error)
    }
  }

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null)
  }

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await fetch(`/api/friendships/${friendshipId}/accept`, {
        method: "POST",
      })
      fetchPendingRequests()
    } catch (error) {
      console.error("Error accepting friend request:", error)
    }
  }

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await fetch(`/api/friendships/${friendshipId}/reject`, {
        method: "POST",
      })
      fetchPendingRequests()
    } catch (error) {
      console.error("Error rejecting friend request:", error)
    }
  }

  // Danh sách menu chính
  const mainMenuItems: MenuItem[] = [
    { text: "Trang chủ", icon: <HomeIcon />, path: "/", active: true },
    { text: "Khám phá", icon: <Explore />, path: "/explore" },
    {
      text: "Thông báo",
      icon: <Notifications />,
      path: "#",
      onClick: handleNotificationClick,
      badge: pendingRequests.length
    },
    {
      text: "Tin nhắn",
      icon: <Chat />,
      path: "/messages",
      onClick: onToggleChat
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

  // Nếu là chat-sidebar thì chỉ render ChatBox
  if (className === "chat-sidebar") {
    return (
      <ChatBox
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        receiverId={selectedReceiverId}
        currentUserId={currentUserId.toString()}
      />
    )
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
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
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

      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
          },
        }}
      >
        {pendingRequests.length === 0 ? (
          <MenuItem disabled>Không có thông báo mới</MenuItem>
        ) : (
          pendingRequests.map((request) => (
            <MenuItem key={request.id} sx={{ display: "block", py: 1 }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <Person sx={{ mr: 1 }} />
                <span>{`${request.firstName} ${request.lastName} muốn kết bạn với bạn`}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAcceptRequest(request.id)}
                >
                  Đồng ý
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleRejectRequest(request.id)}
                >
                  Từ chối
                </Button>
              </div>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  )
}

export default LeftSidebar

