"use client"
import { Avatar, Box, IconButton, Typography, alpha } from "@mui/material"
import { ArrowBack, MoreVert } from "@mui/icons-material"
import type { Conversation } from "../../../types/message"

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

  return (
    <Box
      sx={{
        p: 1.5,
        display: "flex",
        alignItems: "center",
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <IconButton onClick={onBack} sx={{ mr: 1 }}>
        <ArrowBack />
      </IconButton>
      <Avatar
        src={conversation.user.avatar}
        alt={`${conversation.user.firstName} ${conversation.user.lastName}`}
        sx={{
          width: 36,
          height: 36,
          border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      />
      <Box sx={{ ml: 1.5, flexGrow: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          {`${conversation.user.firstName} ${conversation.user.lastName}`}
        </Typography>
        <Typography
          variant="caption"
          color={conversation.user.isOnline ? "success.main" : "text.secondary"}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: conversation.user.isOnline ? "success.main" : "text.disabled",
              mr: 0.5,
            }}
          />
          {conversation.user.isOnline ? "Đang hoạt động" : "Không hoạt động"}
        </Typography>
      </Box>
      <IconButton>
        <MoreVert />
      </IconButton>
    </Box>
  )
}

export default MobileChatHeader
