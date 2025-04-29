"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  alpha,
  Tooltip,
  CircularProgress,
  Fade,
  ListItem,
  useTheme
} from "@mui/material"
import {
  AttachFile,
  EmojiEmotions,
  Image,
  Send
} from "@mui/icons-material"
import type { Conversation, Message as MessageType } from "../../../types/message"
import MessageBubble from "./MessageBubble"
import { Client } from '@stomp/stompjs'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { styled } from "@mui/material/styles"

const MessageItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: "4px 8px",
  maxWidth: "70%",
  margin: "4px 0",
  width: "auto",
  animation: "fadeIn 0.3s ease-in-out",
  "@keyframes fadeIn": {
    from: {
      opacity: 0,
      transform: "translateY(10px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderAvatar?: string;
  senderName: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
}

const formatTime = (timestamp: string | number[]) => {
  try {
    if (!timestamp) {
      return "00:00"
    }

    let date: Date
    if (Array.isArray(timestamp)) {
      // Xử lý timestamp dạng mảng [year, month, day, hour, minute]
      if (timestamp.length === 5) {
        date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4])
      }
      // Xử lý timestamp dạng mảng [year, month, day, hour, minute, second]
      else if (timestamp.length === 6) {
        date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5])
      } else {
        console.error('Invalid timestamp array length:', timestamp)
        return "00:00"
      }
    } else {
      // Xử lý timestamp dạng chuỗi ISO
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp)
      return "00:00"
    }

    const now = new Date()
    const messageDate = date

    // Nếu tin nhắn được gửi trong cùng ngày
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
    // Nếu tin nhắn được gửi trong cùng tuần
    else if (now.getTime() - messageDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return messageDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
    // Nếu tin nhắn được gửi trước đó
    else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  } catch (error) {
    console.error('Error formatting time:', error, 'Timestamp:', timestamp)
    return "00:00"
  }
}

interface ChatAreaProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: number
  onSendMessage: (text: string, fileUrl?: string, fileType?: 'image' | 'video' | 'document' | 'file', fileName?: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  ws: Client | null
  showEmojiPicker: boolean
  onEmojiClick: (emoji: any) => string
  toggleEmojiPicker: () => void
  isUploading: boolean
}

type FileType = 'image' | 'video' | 'document' | 'file';

const getFileUrl = (fileUrl: string) => {
  return fileUrl.startsWith('http') ? fileUrl : `http://localhost:8080${fileUrl}`;
};

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  messagesEndRef,
  ws,
  showEmojiPicker,
  onEmojiClick,
  toggleEmojiPicker,
  isUploading
}) => {
  const theme = useTheme();
  const messageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAttachOptions, setShowAttachOptions] = useState(false)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [localMessages, setLocalMessages] = useState<Message[]>([])

  useEffect(() => {
    if (messages && messages.length > 0) {
      setLocalMessages(messages)
    }
  }, [messages])

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setIsUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8080/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error response:', errorData);
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);

      if (!data.data || !data.data.fileUrl) {
        throw new Error('Invalid response format');
      }

      return data.data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSendMessage = async () => {
    const messageText = messageInputRef.current?.value?.trim() || "";
    let fileUrl: string | undefined = undefined;
    let fileType: 'image' | 'video' | 'document' | 'file' | undefined = undefined;
    let fileName: string | undefined = undefined;

    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      console.log('Selected file:', file);

      const uploadedUrl = await handleFileUpload(file);
      if (uploadedUrl) {
        fileUrl = uploadedUrl;

        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
          fileType = 'image';
        } else if (['mp4', 'webm', 'mov'].includes(extension)) {
          fileType = 'video';
        } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
          fileType = 'document';
        } else {
          fileType = 'file';
        }
        fileName = file.name;
      }
    }

    if (messageText || fileUrl) {
      onSendMessage(messageText, fileUrl, fileType, fileName);
      if (messageInputRef.current) {
        messageInputRef.current.value = "";
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleAttachOptions = () => {
    setShowAttachOptions(!showAttachOptions)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    if (messageInputRef.current) {
      messageInputRef.current.value = (messageInputRef.current.value || "") + emoji.native
    }
    toggleEmojiPicker()
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.paper",
      }}
    >
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
            src={conversation.user.avatar ? `http://localhost:8080${conversation.user.avatar}` : undefined}
            alt={conversation.user.name}
            sx={{
              width: 40,
              height: 40,
              mr: 1.5,
              border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              bgcolor: !conversation.user.avatar ? 'primary.main' : 'transparent'
            }}
          >
            {!conversation.user.avatar && conversation.user.name.charAt(0)}
          </Avatar>
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
          minHeight: 0,
          height: 'calc(100vh - 180px)',
          maxHeight: 'calc(100vh - 180px)',
        }}
      >
        {localMessages.length === 0 ? (
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
          localMessages.map((message, index) => {
            const isCurrentUser = String(message.senderId) === String(currentUserId);
            const showAvatar = !isCurrentUser && (index === 0 || localMessages[index - 1].senderId !== message.senderId);
            const isLastInGroup = index === localMessages.length - 1 || localMessages[index + 1].senderId !== message.senderId;

            return (
              <Fade in={true} key={message.id} timeout={300}>
                <MessageItem
                  sx={{
                    alignItems: isCurrentUser ? "flex-end" : "flex-start",
                    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    margin: "4px 0",
                    padding: "4px 8px",
                  }}
                >
                  <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                    alignSelf: isCurrentUser ? "flex-end" : "flex-start"
                  }}>
                    <Tooltip title={message.senderName || "User"}>
                      <Avatar
                        src={message.senderAvatar ? `http://localhost:8080${message.senderAvatar}` : undefined}
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: !message.senderAvatar ? "grey.300" : "transparent",
                        }}
                      >
                        {(!message.senderAvatar && message.senderName) ? message.senderName.charAt(0) : "U"}
                      </Avatar>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      {message.senderName || "User"}
                    </Typography>
                  </Box>
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: isCurrentUser ? theme.palette.primary.main : theme.palette.grey[100],
                      color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
                      maxWidth: '100%',
                    }}
                  >
                    {message.content && (
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {message.content}
                      </Typography>
                    )}
                    {message.fileUrl && (
                      <Box sx={{ mt: 1 }}>
                        {message.fileType === 'image' ? (
                          <img
                            src={getFileUrl(message.fileUrl)}
                            alt={message.fileName || 'Uploaded image'}
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              display: 'block'
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1,
                              bgcolor: 'rgba(0,0,0,0.05)',
                              borderRadius: '8px'
                            }}
                          >
                            <AttachFile />
                            <Typography variant="body2">
                              {message.fileName}
                            </Typography>
                            <a
                              href={getFileUrl(message.fileUrl)}
                              download={message.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.preventDefault();
                                const fileUrl = message.fileUrl;
                                if (typeof fileUrl === 'string') {
                                  window.open(getFileUrl(fileUrl), '_blank', 'noopener,noreferrer');
                                }
                              }}
                              style={{
                                color: isCurrentUser ? 'white' : theme.palette.primary.main,
                                textDecoration: 'none'
                              }}
                            >
                              Tải xuống
                            </a>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      alignSelf: isCurrentUser ? "flex-end" : "flex-start"
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </MessageItem>
              </Fade>
            );
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Chọn emoji">
            <IconButton
              color="primary"
              size="small"
              onClick={toggleEmojiPicker}
            >
              <EmojiEmotions />
            </IconButton>
          </Tooltip>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          <Tooltip title="Đính kèm file">
            <IconButton
              color="primary"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
            >
              <AttachFile />
            </IconButton>
          </Tooltip>

          <Tooltip title="Gửi hình ảnh">
            <IconButton
              color="primary"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
            >
              <Image />
            </IconButton>
          </Tooltip>

          <TextField
            fullWidth
            placeholder="Nhập tin nhắn..."
            size="small"
            inputRef={messageInputRef}
            onKeyPress={handleKeyPress}
            disabled={isUploadingFile}
            InputProps={{
              sx: {
                borderRadius: 4,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
              },
            }}
          />

          <Tooltip title="Gửi tin nhắn">
            <IconButton
              color="primary"
              size="small"
              onClick={handleSendMessage}
              disabled={isUploadingFile}
            >
              <Send />
            </IconButton>
          </Tooltip>
        </Box>

        {isUploadingFile && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="caption" color="text.secondary">
              Đang tải lên file...
            </Typography>
          </Box>
        )}

        {/* Emoji picker */}
        {showEmojiPicker && (
          <Box sx={{ position: 'absolute', bottom: '100%', right: 0, mb: 1 }}>
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
            />
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ChatArea
