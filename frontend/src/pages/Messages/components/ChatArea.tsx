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
import { Message } from "../../../types/message"

const MessageItem = styled(ListItem)(({ }) => ({
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
  truncateFileName: (fileName: string, maxLength?: number) => string
}

type FileType = 'image' | 'video' | 'document' | 'file';

const API_URL = import.meta.env.VITE_API_URL;

const getFileUrl = (fileUrl: string) => {
  if (!fileUrl) return '';

  // Nếu là URL Cloudinary
  if (fileUrl.includes('cloudinary.com')) {
    // Nếu là file ảnh, giữ nguyên URL
    if (fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return fileUrl;
    }
    // Nếu là file khác, chuyển về endpoint download của backend
    return `${API_URL}/api/chat/download?fileUrl=${encodeURIComponent(fileUrl)}`;
  }

  // Nếu là URL local
  return fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`;
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
  isUploading,
  truncateFileName
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
      // Cuộn xuống khi có tin nhắn mới
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
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

      const response = await fetch(`${API_URL}/api/chat/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || `Upload failed with status ${response.status}`);
      }

      if (!data.data || !data.data.fileUrl) {
        throw new Error('Invalid response format');
      }

      // Xử lý URL file trước khi trả về
      const fileUrl = data.data.fileUrl;

      // Xác định loại file dựa vào extension
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType: 'image' | 'video' | 'document' | 'file';

      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        fileType = 'image';
      } else if (['mp4', 'webm', 'mov'].includes(extension)) {
        fileType = 'video';
      } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) {
        fileType = 'document';
      } else {
        fileType = 'file';
      }

      return { fileUrl, fileType };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
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

      try {
        const uploadResult = await handleFileUpload(file);
        if (uploadResult) {
          fileUrl = uploadResult.fileUrl;
          fileType = uploadResult.fileType;
          fileName = file.name;
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        return;
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
    const emojiText = onEmojiClick(emoji)
    if (messageInputRef.current) {
      const start = messageInputRef.current.selectionStart || 0
      const end = messageInputRef.current.selectionEnd || 0
      const text = messageInputRef.current.value
      const newText = text.substring(0, start) + emojiText + text.substring(end)
      messageInputRef.current.value = newText
      messageInputRef.current.focus()
      messageInputRef.current.setSelectionRange(start + emojiText.length, start + emojiText.length)
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
                          <Box
                            component="img"
                            src={message.fileUrl}
                            alt={message.fileName || 'Uploaded image'}
                            sx={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              objectFit: 'contain',
                              cursor: 'pointer',
                              '&:hover': {
                                opacity: 0.9
                              }
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(message.fileUrl, '_blank');
                            }}
                            onError={(e) => {
                              console.error('Error loading image:', e);
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.png';
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
                              {message.fileName ? truncateFileName(message.fileName) : 'File đính kèm'}
                            </Typography>
                            <a
                              href={getFileUrl(message.fileUrl)}
                              download={message.fileName}
                              onClick={async (e) => {
                                e.preventDefault();
                                if (!message.fileUrl) return;
                                const fileUrl = getFileUrl(message.fileUrl);
                                if (fileUrl) {
                                  try {
                                    const token = localStorage.getItem('accessToken');
                                    if (!token) {
                                      console.error('No access token found');
                                      return;
                                    }

                                    // Gọi API endpoint mới để tải file
                                    const response = await fetch(`${API_URL}/api/chat/download?fileUrl=${encodeURIComponent(fileUrl)}`, {
                                      headers: {
                                        'Authorization': `Bearer ${token}`
                                      }
                                    });

                                    if (!response.ok) {
                                      throw new Error('Download failed');
                                    }

                                    // Lấy blob từ response
                                    const blob = await response.blob();

                                    // Tạo URL tạm thời cho blob
                                    const url = window.URL.createObjectURL(blob);

                                    // Tạo thẻ a để tải file
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = message.fileName || 'file';
                                    document.body.appendChild(link);
                                    link.click();

                                    // Cleanup
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    console.error('Error downloading file:', error);
                                  }
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
          position: 'relative'
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
          <Box
            sx={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              zIndex: 1000,
              mb: 1,
              boxShadow: 3,
              borderRadius: 1
            }}
          >
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme={theme.palette.mode}
              set="native"
              previewPosition="none"
              skinTonePosition="none"
              autoFocus={true}
            />
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ChatArea
