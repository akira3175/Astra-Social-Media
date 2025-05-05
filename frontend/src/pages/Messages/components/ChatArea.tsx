"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
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
  useTheme,
  Badge,
} from "@mui/material"
import { AttachFile, EmojiEmotions, Image, Send, Download } from "@mui/icons-material"
import type { Conversation } from "../../../types/message"
import type { Client } from "@stomp/stompjs"
import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { styled } from "@mui/material/styles"
import type { Message } from "../../../types/message"
import MessageService from "../../../services/messageService"
const MessageItem = styled(ListItem)(({}) => ({
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
}))

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
        console.error("Invalid timestamp array length:", timestamp)
        return "00:00"
      }
    } else {
      // Xử lý timestamp dạng chuỗi ISO
      date = new Date(timestamp)
    }

    if (isNaN(date.getTime())) {
      console.error("Invalid timestamp:", timestamp)
      return "00:00"
    }

    const now = new Date()
    const messageDate = date

    // Nếu tin nhắn được gửi trong cùng ngày
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }
    // Nếu tin nhắn được gửi trong cùng tuần
    else if (now.getTime() - messageDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return messageDate.toLocaleDateString("vi-VN", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }
    // Nếu tin nhắn được gửi trước đó
    else {
      return messageDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }
  } catch (error) {
    console.error("Error formatting time:", error, "Timestamp:", timestamp)
    return "00:00"
  }
}

interface ChatAreaProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: number
  onSendMessage: (
    text: string,
    fileUrl?: string,
    fileType?: "image" | "video" | "document" | "file",
    fileName?: string,
  ) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  ws: Client | null
  showEmojiPicker: boolean
  onEmojiClick: (emoji: any) => string
  toggleEmojiPicker: () => void
  isUploading: boolean
  truncateFileName: (fileName: string, maxLength?: number) => string
}

type FileType = "image" | "video" | "document" | "file"

const API_URL = import.meta.env.VITE_API_URL

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  messagesEndRef,
  showEmojiPicker,
  onEmojiClick,
  toggleEmojiPicker,
  truncateFileName,
}) => {
  const theme = useTheme()
  const messageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [imagePreview, setImagePreview] = useState<{ url: string; open: boolean }>({ url: "", open: false })

  // Sử dụng useMemo để tối ưu hóa việc xử lý tin nhắn
  const processedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return []

    return messages.map((message) => ({
      ...message,
      formattedTime: formatTime(message.timestamp),
    }))
  }, [messages])

  useEffect(() => {
    if (processedMessages && processedMessages.length > 0) {
      setLocalMessages(processedMessages)
      // Cuộn xuống khi có tin nhắn mới
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }
  }, [processedMessages])

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file) return null

      setIsUploadingFile(true)

      try {
        const response = await MessageService.uploadFile(file)

        console.log(response)

        if (!response) {
          throw new Error(`Upload failed with status ${response}`)
        }

        // Xử lý URL file trước khi trả về
        const fileUrl = response

        // Xác định loại file dựa vào extension
        const extension = file.name.split(".").pop()?.toLowerCase() || ""
        let fileType: FileType

        if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
          fileType = "image"
        } else if (["mp4", "webm", "mov"].includes(extension)) {
          fileType = "video"
        } else if (["pdf", "doc", "docx", "txt"].includes(extension)) {
          fileType = "document"
        } else {
          fileType = "file"
        }

        return { fileUrl, fileType }
      } catch (error) {
        console.error("Error uploading file:", error)
        throw error
      } finally {
        setIsUploadingFile(false)
      }
    },
    [API_URL],
  )

  const handleSendMessage = useCallback(async () => {
    const messageText = messageInputRef.current?.value?.trim() || ""
    let fileUrl: string | undefined = undefined
    let fileType: FileType | undefined = undefined
    let fileName: string | undefined = undefined

    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0]

      try {
        const uploadResult = await handleFileUpload(file)
        if (uploadResult) {
          fileUrl = uploadResult.fileUrl
          fileType = uploadResult.fileType
          fileName = file.name
        }
      } catch (error) {
        console.error("Error uploading file:", error)
        return
      }
    }

    if (messageText || fileUrl) {
      onSendMessage(messageText, fileUrl, fileType, fileName)
      if (messageInputRef.current) {
        messageInputRef.current.value = ""
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [handleFileUpload, onSendMessage])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  const handleEmojiSelect = useCallback(
    (emoji: any) => {
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
    },
    [onEmojiClick],
  )

  const openImagePreview = useCallback((url: string) => {
    setImagePreview({ url, open: true })
  }, [])

  const closeImagePreview = useCallback(() => {
    setImagePreview({ url: "", open: false })
  }, [])

  const handleDownloadFile = useCallback(
    async (fileUrl: string, fileName = "file") => {
      if (!fileUrl) return

      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          console.error("No access token found")
          return
        }

        const response = await fetch(`${API_URL}chat/download?fileUrl=${encodeURIComponent(fileUrl)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Download failed")
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error downloading file:", error)
      }
    },
    [API_URL],
  )

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
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            variant="dot"
            color={conversation.user.isOnline ? "success" : "default"}
            sx={{
              "& .MuiBadge-badge": {
                width: 10,
                height: 10,
                borderRadius: "50%",
                border: "2px solid white",
              },
            }}
          >
            <Avatar
              src={conversation.user.avatar ? conversation.user.avatar : undefined}
              alt={conversation.user.lastName + " " + conversation.user.firstName}
              sx={{
                width: 40,
                height: 40,
                mr: 1.5,
                border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                bgcolor: !conversation.user.avatar ? "primary.main" : "transparent",
              }}
            >
              {!conversation.user.avatar && conversation.user.firstName?.charAt(0)}
            </Avatar>
          </Badge>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {conversation.user.lastName} {conversation.user.firstName}
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
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: conversation.user.isOnline ? "success.main" : "text.disabled",
                  mr: 0.5,
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
          backgroundBlendMode: "overlay",
          backgroundSize: "200px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
          minHeight: 0,
          height: "calc(100vh - 180px)",
          maxHeight: "calc(100vh - 180px)",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            },
          },
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
            </Typography>
          </Box>
        ) : (
          localMessages.map((message, index) => {
            const isCurrentUser = String(message.sender.id) === String(currentUserId)
            const isLastInGroup =
              index === localMessages.length - 1 || localMessages[index + 1].sender.id !== message.sender.id
            const isFirstInGroup = index === 0 || localMessages[index - 1].sender.id !== message.sender.id

            return (
              <Fade in={true} key={message.id} timeout={300}>
                <MessageItem
                  sx={{
                    alignItems: isCurrentUser ? "flex-end" : "flex-start",
                    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                    margin: isFirstInGroup ? "8px 0 2px 0" : "2px 0",
                    padding: "2px 8px",
                  }}
                >
                  {isFirstInGroup && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                      }}
                    >
                      <Tooltip title={message.sender.lastName + " " + message.sender.firstName || "User"}>
                        <Avatar
                          src={message.sender.avatar ? message.sender.avatar : undefined}
                          sx={{
                            width: 24,
                            height: 24,
                            bgcolor: !message.sender.avatar ? "grey.300" : "transparent",
                          }}
                        >
                          {!message.sender.avatar && message.sender.firstName
                            ? message.sender.firstName.charAt(0)
                            : "U"}
                        </Avatar>
                      </Tooltip>
                      <Typography variant="caption" color="text.secondary">
                        {message.sender.lastName + " " + message.sender.firstName || "User"}
                      </Typography>
                    </Box>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: isCurrentUser
                        ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)}, ${theme.palette.primary.main})`
                        : theme.palette.grey[100],
                      color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
                      maxWidth: "100%",
                      boxShadow: isCurrentUser
                        ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                        : `0 2px 8px ${alpha(theme.palette.grey[300], 0.2)}`,
                    }}
                  >
                    {message.content && (
                      <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                        {message.content}
                      </Typography>
                    )}
                    {message.fileUrl && (
                      <Box sx={{ mt: message.content ? 1 : 0 }}>
                        {message.fileType === "image" ? (
                          <Box
                            component="img"
                            src={message.fileUrl}
                            alt={message.fileName || "Uploaded image"}
                            sx={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              borderRadius: "8px",
                              objectFit: "contain",
                              cursor: "pointer",
                              transition: "transform 0.2s ease",
                              "&:hover": {
                                transform: "scale(1.02)",
                                opacity: 0.95,
                              },
                            }}
                            onClick={() => openImagePreview(message.fileUrl || "")}
                            onError={(e) => {
                              console.error("Error loading image:", e)
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder-image.png"
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 1,
                              bgcolor: isCurrentUser
                                ? alpha(theme.palette.common.white, 0.15)
                                : alpha(theme.palette.common.black, 0.05),
                              borderRadius: "8px",
                              transition: "background-color 0.2s ease",
                              "&:hover": {
                                bgcolor: isCurrentUser
                                  ? alpha(theme.palette.common.white, 0.25)
                                  : alpha(theme.palette.common.black, 0.08),
                              },
                            }}
                          >
                            <AttachFile fontSize="small" />
                            <Typography
                              variant="body2"
                              sx={{ flexGrow: 1, overflow: "hidden", textOverflow: "ellipsis" }}
                            >
                              {message.fileName ? truncateFileName(message.fileName) : "File đính kèm"}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadFile(message.fileUrl || "", message.fileName)}
                              sx={{
                                color: isCurrentUser ? theme.palette.primary.contrastText : theme.palette.primary.main,
                                "&:hover": {
                                  bgcolor: isCurrentUser
                                    ? alpha(theme.palette.common.white, 0.15)
                                    : alpha(theme.palette.primary.main, 0.1),
                                },
                              }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Paper>
                  {isLastInGroup && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        alignSelf: isCurrentUser ? "flex-end" : "flex-start",
                      }}
                    >
                      {message.formattedTime || formatTime(message.timestamp)}
                    </Typography>
                  )}
                </MessageItem>
              </Fade>
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
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Chọn emoji">
            <IconButton color="primary" size="small" onClick={toggleEmojiPicker}>
              <EmojiEmotions />
            </IconButton>
          </Tooltip>

          <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileSelect} />

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
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*"
                  fileInputRef.current.click()
                }
              }}
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
            multiline
            maxRows={3}
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
              onClick={handleSendMessage}
              disabled={isUploadingFile}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
                "&.Mui-disabled": {
                  bgcolor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.primary.contrastText,
                },
              }}
            >
              <Send />
            </IconButton>
          </Tooltip>
        </Box>

        {isUploadingFile && (
          <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
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
              position: "absolute",
              bottom: "100%",
              left: 0,
              zIndex: 1000,
              mb: 1,
              boxShadow: 3,
              borderRadius: 1,
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

      {/* Image Preview Modal */}
      {imagePreview.open && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.8)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
          onClick={closeImagePreview}
        >
          <Box
            component="img"
            src={imagePreview.url}
            alt="Preview"
            sx={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      )}
    </Box>
  )
}

export default ChatArea
