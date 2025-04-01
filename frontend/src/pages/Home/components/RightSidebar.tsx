import React, { useEffect, useState } from "react"
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
import { PersonAdd } from "@mui/icons-material"

interface User {
  id: number
  firstName: string
  lastName: string
  avatar: string
}

interface SuggestedUser {
  id: number
  name: string
  avatar: string
  mutualFriends: number
}

interface RightSidebarProps {
  currentUserId: number
}

// Giả lập dữ liệu người dùng được đề xuất
const SUGGESTED_USERS: User[] = [
  {
    id: 201,
    firstName: "Phạm",
    lastName: "Thị",
    avatar: "https://i.pravatar.cc/150?img=10",
  },
  {
    id: 202,
    firstName: "Hoàng",
    lastName: "Văn",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: 203,
    firstName: "Vũ",
    lastName: "Thị",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: 204,
    firstName: "Nguyễn",
    lastName: "Văn",
    avatar: "https://i.pravatar.cc/150?img=13",
  },
  {
    id: 205,
    firstName: "Trần",
    lastName: "Thị",
    avatar: "https://i.pravatar.cc/150?img=14",
  },
  {
    id: 206,
    firstName: "Lê",
    lastName: "Văn",
    avatar: "https://i.pravatar.cc/150?img=15",
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

const RightSidebar: React.FC<RightSidebarProps> = ({ currentUserId }) => {
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      console.log('Fetching suggestions for userId:', currentUserId)
      console.log('Using token:', token)
      const response = await fetch(`/api/friendships/suggestions/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      console.log('Suggestions response:', data)
      setSuggestions(data)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendFriendRequest = async (userId: number) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/friendships/request/${userId}`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      // Cập nhật lại danh sách gợi ý
      fetchSuggestions()
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  return (
    <Paper
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
        {/* Hiển thị gợi ý từ API */}
        {suggestions.map((user) => (
          <ListItem key={user.id} sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar src={user.avatar} />
            </ListItemAvatar>
            <ListItemText
              primary={`${user.firstName} ${user.lastName}`}
              secondary="Gợi ý cho bạn"
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<PersonAdd />}
              sx={{ minWidth: 100 }}
              onClick={() => handleSendFriendRequest(user.id)}
            >
              Kết bạn
            </Button>
          </ListItem>
        ))}
        {suggestions.length === 0 && !loading && (
          <ListItem>
            <ListItemText primary="Không có gợi ý kết bạn nào" />
          </ListItem>
        )}
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
      {loading && (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography>Đang tải...</Typography>
        </Box>
      )}
    </Paper>
  )
}

export default RightSidebar

