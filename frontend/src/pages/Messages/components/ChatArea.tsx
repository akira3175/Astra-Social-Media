"use client"

import type React from "react"
import { useState } from "react"
import { 
  Avatar, 
  Box, 
  IconButton, 
  InputAdornment, 
  Paper, 
  TextField, 
  Typography, 
  alpha,
  Tooltip,
} from "@mui/material"
import { 
  AttachFile, 
  EmojiEmotions, 
  Image, 
  Mic, 
  MoreVert, 
  Send, 
  Videocam,
  InsertDriveFile,
  PhotoLibrary,
  Gif
} from "@mui/icons-material"
import type { Conversation, Message } from "../../../types/message"
import MessageBubble from "./MessageBubble"

interface ChatAreaProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: number
  onSendMessage: (text: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  messagesEndRef,
}) => {
  const [newMessage, setNewMessage] = useState("")
  const [showAttachOptions, setShowAttachOptions] = useState(false)

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

  const toggleAttachOptions = () => {
    setShowAttachOptions(!showAttachOptions)
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
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar 
            src={conversation.user.avatar} 
            alt={conversation.user.name} 
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 1.5,
              border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }} 
          />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {conversation.user.name}
            </Typography>
            <Typography 
              variant="caption" 
              color={conversation.user.isOnline ? "success.main" : "text.secondary"}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: conversation.user.isOnline ? 'success.main' : 'text.disabled',
                  mr: 0.5
                }}
              />
              {conversation.user.isOnline ? "Đang hoạt động" : "Không hoạt động"}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Tooltip title="Gọi video">
            <IconButton color="primary" size="small" sx={{ mr: 1 }}>
              <Videocam />
            </IconButton>
          </Tooltip>
          <Tooltip title="Gọi thoại">
            <IconButton color="primary" size="small" sx={{ mr: 1 }}>
              <Mic />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tùy chọn">
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Tooltip>
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
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
          backgroundImage: 'url("/placeholder.svg?height=500&width=500")',
          backgroundBlendMode: 'overlay',
          backgroundSize: '200px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
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
          position: 'relative',
        }}
      >
        {showAttachOptions && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: '100%',
              left: 16,
              p: 1,
              display: 'flex',
              gap: 1,
              mb: 0.5,
              borderRadius: 2,
            }}
          >
            <Tooltip title="Hình ảnh">
              <IconButton color="primary" size="small">
                <PhotoLibrary />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tài liệu">
              <IconButton color="primary" size="small">
                <InsertDriveFile />
              </IconButton>
            </Tooltip>
            <Tooltip title="GIF">
              <IconButton color="primary" size="small">
                <Gif />
              </IconButton>
            </Tooltip>
          </Paper>
        )}
        
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Biểu tượng cảm xúc">
            <IconButton size="small" sx={{ mr: 1 }}>
              <EmojiEmotions />
            </IconButton>
          </Tooltip>
          <Tooltip title="Đính kèm">
            <IconButton size="small" sx={{ mr: 1 }} onClick={toggleAttachOptions}>
              <AttachFile />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hình ảnh">
            <IconButton size="small" sx={{ mr: 1 }}>
              <Image />
            </IconButton>
          </Tooltip>
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
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton 
                    color="primary"
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim()} 
                    edge="end"
                    sx={{ 
                      bgcolor: (theme) => newMessage.trim() ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      '&:hover': {
                        bgcolor: (theme) => newMessage.trim() ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                      }
                    }}
                  >
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
