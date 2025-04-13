import type React from "react"
import { Avatar, Box, Paper, Typography, alpha } from "@mui/material"
import { styled } from "@mui/material/styles"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import type { Message } from "../../../types/message"

interface MessageBubbleProps {
  message: Message
  isCurrentUser: boolean
  showAvatar: boolean
  isLastInGroup: boolean
  avatar: string
}

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isCurrentUser" && prop !== "showAvatar",
})<{ isCurrentUser: boolean; showAvatar: boolean }>(({ theme, isCurrentUser, showAvatar }) => ({
  padding: theme.spacing(1.5),
  maxWidth: "75%",
  borderRadius: 16,
  wordBreak: "break-word",
  backgroundColor: isCurrentUser ? alpha(theme.palette.primary.main, 0.9) : theme.palette.background.paper,
  color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  marginBottom: theme.spacing(0.5),
  borderTopLeftRadius: !isCurrentUser && showAvatar ? 4 : 16,
  borderTopRightRadius: isCurrentUser ? 4 : 16,
}))

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, showAvatar, isLastInGroup, avatar }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isCurrentUser ? "row-reverse" : "row",
        alignItems: "flex-end",
        mb: isLastInGroup ? 2 : 0.5,
      }}
    >
      {showAvatar && !isCurrentUser ? (
        <Avatar
          src={avatar}
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            mb: 1,
            border: (theme) => `2px solid ${alpha(theme.palette.background.paper, 0.8)}`,
          }}
        />
      ) : (
        <Box sx={{ width: 32, height: 32, mr: 1 }} />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isCurrentUser ? "flex-end" : "flex-start",
          maxWidth: "75%",
        }}
      >
        <StyledPaper isCurrentUser={isCurrentUser} showAvatar={showAvatar}>
          <Typography variant="body2">{message.text}</Typography>
        </StyledPaper>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 0.5,
            mb: 1,
            ml: isCurrentUser ? 0 : 1,
            mr: isCurrentUser ? 1 : 0,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
            {message.timestamp}
          </Typography>
          {isCurrentUser && (
            <DoneAllIcon
              sx={{
                ml: 0.5,
                fontSize: "0.9rem",
                color: message.isRead ? "primary.main" : "text.disabled",
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default MessageBubble
