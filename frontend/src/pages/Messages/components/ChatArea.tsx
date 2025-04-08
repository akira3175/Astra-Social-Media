import type React from "react"
import { useState } from "react"
import { Avatar, Box, IconButton, InputAdornment, Paper, TextField, Typography } from "@mui/material"
import { AttachFile, EmojiEmotions, Image, Mic, MoreVert, Send, Videocam } from "@mui/icons-material"
import type { Conversation, Message } from "../../../types/message"
import MessageBubble from "./MessageBubble"

interface ChatAreaProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: number
  onSendMessage: (text: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  messagesEndRef,
}) => {
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!conversation) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Chọn một cuộc trò chuyện để bắt đầu
        </Typography>
      </Box>
    )
  }

  return (
    <>
      {/* Header của khu vực chat */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar src={conversation.user.avatar} alt={conversation.user.name} sx={{ width: 40, height: 40, mr: 1.5 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {conversation.user.name}
            </Typography>
            <Typography variant="caption" color={conversation.user.isOnline ? "success.main" : "text.secondary"}>
              {conversation.user.isOnline ? "Đang hoạt động" : "Không hoạt động"}
            </Typography>
          </Box>
        </Box>
        <Box>
          <IconButton color="primary" size="small" sx={{ mr: 1 }}>
            <Videocam />
          </IconButton>
          <IconButton color="primary" size="small" sx={{ mr: 1 }}>
            <Mic />
          </IconButton>
          <IconButton size="small">
            <MoreVert />
          </IconButton>
        </Box>
      </Box>

      {/* Khu vực hiển thị tin nhắn */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Chưa có tin nhắn nào
            </Typography>
          </Box>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId
            const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].senderId !== message.senderId)
            const isLastInGroup = index === messages.length - 1 || messages[index + 1].senderId !== message.senderId

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={isCurrentUser}
                showAvatar={showAvatar}
                isLastInGroup={isLastInGroup}
                avatar={conversation.user.avatar}
              />
            )
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Thanh nhập tin nhắn */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton size="small" sx={{ mr: 1 }}>
            <EmojiEmotions />
          </IconButton>
          <IconButton size="small" sx={{ mr: 1 }}>
            <AttachFile />
          </IconButton>
          <IconButton size="small" sx={{ mr: 1 }}>
            <Image />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Nhập tin nhắn..."
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton color="primary" onClick={handleSendMessage} disabled={!newMessage.trim()} edge="end">
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>
    </>
  )
}

export default ChatArea
