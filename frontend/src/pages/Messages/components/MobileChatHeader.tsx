"use client"
import { Avatar, Box, IconButton, Typography } from "@mui/material"
import { ArrowBack, MoreVert } from "@mui/icons-material"

// Định nghĩa các interface cần thiết
interface User {
  id: number
  name: string
  avatar: string
  isOnline?: boolean
}

interface MessagePreview {
  id: number
  text: string
  timestamp: string
  isRead: boolean
  senderId: number
}

interface Conversation {
  id: number
  user: User
  lastMessage: MessagePreview
  unreadCount: number
}

// Props cho component
interface MobileChatHeaderProps {
  conversation: Conversation | null
  onBack: () => void
}

// Component
function MobileChatHeader(props: MobileChatHeaderProps) {
  const { conversation, onBack } = props

  // Nếu không có conversation, không hiển thị gì cả
  if (!conversation) {
    return null
  }

  // Phiên bản đơn giản hóa của return statement
  return (
    <Box sx={{ p: 1.5, display: "flex", alignItems: "center", bgcolor: "background.paper" }}>
      <IconButton onClick={onBack}>
        <ArrowBack />
      </IconButton>
      <Avatar src={conversation.user.avatar} />
      <Box sx={{ ml: 1.5, flexGrow: 1 }}>
        <Typography variant="subtitle2">{conversation.user.name}</Typography>
        <Typography variant="caption">{conversation.user.isOnline ? "Đang hoạt động" : "Không hoạt động"}</Typography>
      </Box>
      <IconButton>
        <MoreVert />
      </IconButton>
    </Box>
  )
}

export default MobileChatHeader
