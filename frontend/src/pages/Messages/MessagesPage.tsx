import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Box, Grid, useMediaQuery, useTheme, Typography } from "@mui/material"
import BasePage from "../Base/BasePage"
import ConversationList from "./components/ConversationList"
import ChatArea from "./components/ChatArea"
import { useCurrentUser } from "../../contexts/currentUserContext"
import type { Conversation, Message } from "../../types/message"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { useEmojiPicker } from "../../hooks/useEmojiPicker"
import { useFileUpload } from "../../hooks/useFileUpload"
import MessageService from "../../services/messageService"

const MessagesPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { currentUser } = useCurrentUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showEmojiPicker, handleEmojiClick, toggleEmojiPicker } = useEmojiPicker()
  const { isUploading } = useFileUpload()
  const [ws, setWs] = useState<Client | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [shouldScroll, setShouldScroll] = useState(true)

  // Thêm hàm truncateFileName
  const truncateFileName = (fileName: string, maxLength = 15) => {
    if (fileName.length <= maxLength) return fileName
    const extension = fileName.split(".").pop()
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."))
    const truncatedName = nameWithoutExt.substring(0, maxLength - 3) + "..."
    return `${truncatedName}.${extension}`
  }

  // Chọn cuộc trò chuyện đầu tiên khi trang được tải
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      handleSelectConversation(conversations[0])
    }
  }, [conversations])

  // Thêm hàm loadMessages
  const loadMessages = async () => {
    if (!selectedConversation || !currentUser) return

    try {
      const response = await MessageService.getMessages(selectedConversation.user.id)
      setMessages(response)
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  // Xử lý khi chọn cuộc trò chuyện
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowMobileChat(true)
    setShouldScroll(true)
  }

  // Thêm useEffect để theo dõi selectedConversation
  useEffect(() => {
    if (selectedConversation) {
      loadMessages()
    }
  }, [selectedConversation])

  // Thêm hàm getFileUrl
  const getFileUrl = (fileUrl: string) => {
    if (!fileUrl) return ""

    // Nếu là URL Cloudinary
    if (fileUrl.includes("cloudinary.com")) {
      const token = localStorage.getItem("accessToken")
      return `${fileUrl}?token=${token}`
    }

    // Nếu là URL local
    return fileUrl.startsWith("http") ? fileUrl : `http://localhost:8080${fileUrl}`
  }

  // Sửa lại hàm handleSendMessage
  const handleSendMessage = async (
    text: string,
    fileUrl?: string,
    fileType?: "image" | "video" | "document" | "file",
    fileName?: string,
  ) => {
    if (!selectedConversation || !ws) return

    // Xử lý URL file
    let processedFileUrl = fileUrl
    if (fileUrl) {
      processedFileUrl = getFileUrl(fileUrl)
    }

    const message: Message = {
      id: Date.now(),
      text,
      timestamp: new Date().toISOString(),
      sender: currentUser,
      receiver: selectedConversation.user,
      isRead: false,
      fileUrl: processedFileUrl,
      hasAttachment: !!fileUrl,
      attachmentType: fileType,
      fileName,
    }

    console.log("Sending message:", message)

    // Thêm tin nhắn vào danh sách ngay lập tức
    setMessages((prev) => {
      const newMessages = [...prev, message]
      return newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    })

    // Gửi tin nhắn qua WebSocket
    ws.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        ...message,
        content: text,
        type: fileType || "text",
        fileUrl: processedFileUrl,
      }),
    })
  }

  // Xử lý tin nhắn nhận được từ WebSocket
  useEffect(() => {
    if (!ws) return

    const subscription = ws.subscribe(`/user/${currentUser?.id}/queue/messages`, (message) => {
      try {
        const data = JSON.parse(message.body)
        console.log("Received message:", data)

        // Xử lý URL file
        let processedFileUrl = data.fileUrl
        if (data.fileUrl && !data.fileUrl.startsWith("http")) {
          processedFileUrl = `http://${data.fileUrl}`
        }

        // Cập nhật tin nhắn trong state
        setMessages((prev) => {
          const existingMessage = prev.find((m) => m.id === data.id)
          if (existingMessage) {
            return prev
          }
          const newMessages = [
            ...prev,
            {
              id: data.id,
              text: data.content || data.text || "",
              timestamp: data.timestamp,
              sender: data.sender,
              receiver: data.receiver,
              isRead: data.isRead || false,
              fileUrl: processedFileUrl,
              fileType: data.type || data.fileType,
              fileName: data.fileName,
              hasAttachment: !!data.fileUrl,
            },
          ]
          return newMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        })
      } catch (error) {
        console.error("Error processing message:", error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [ws, currentUser?.id])

  // Kết nối WebSocket khi component mount
  useEffect(() => {
    if (currentUser) {
      connectWebSocket()
    }
    return () => {
      if (ws) {
        ws.deactivate()
      }
    }
  }, [currentUser])

  // Kết nối WebSocket
  const connectWebSocket = () => {
    if (isConnecting || !currentUser) return

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL
    setIsConnecting(true)
    const token = localStorage.getItem("accessToken")
    const socket = new SockJS(wsUrl)
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str: string) => {
        console.log(str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    stompClient.activate()
    stompClient.onConnect = () => {
      console.log("Connected to WebSocket")
      setWs(stompClient)
      setIsConnecting(false)
      reconnectAttempts.current = 0

      // Subscribe vào private channel
      stompClient.subscribe(`/user/${currentUser.id}/queue/messages`, (message) => {
        try {
          const data = JSON.parse(message.body)
          console.log("Received private message:", data)

          // Kiểm tra xem tin nhắn đã tồn tại chưa
          if (messages.some((m) => m.id === data.id)) {
            return
          }

          // Nếu là tin nhắn mới, thêm vào danh sách
          const newMessage = {
            id: data.id,
            text: data.content || data.text || "",
            timestamp: data.timestamp,
            sender: data.sender,
            isRead: false,
            conversationId: data.conversationId,
            receiver: data.receiver,
            ...(data.fileUrl && {
              fileUrl: data.fileUrl,
              fileType: data.fileType,
              fileName: data.fileName,
            }),
          }

          setMessages((prev) =>
            [...prev, newMessage].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
          )

          // Cập nhật lastMessage trong conversations
          setConversations((prev) =>
            prev.map((conv) => {
              if (conv.id === data.conversationId) {
                return {
                  ...conv,
                  lastMessage: {
                    id: data.id,
                    text: data.content || data.text || "",
                    timestamp: data.timestamp,
                    isRead: false,
                    senderId: Number(data.senderId),
                  },
                  unreadCount: conv.id === selectedConversation?.id ? 0 : conv.unreadCount + 1,
                }
              }
              return conv
            }),
          )
        } catch (error) {
          console.error("Error parsing private message:", error)
        }
      })

      // Subscribe vào public channel
      stompClient.subscribe("/topic/public", (message) => {
        try {
          const data = JSON.parse(message.body)
          console.log("Received public message:", data)

          // Chỉ xử lý tin nhắn liên quan đến người dùng hiện tại
          if (data.senderId === currentUser.id || data.receiverId === currentUser.id) {
            // Kiểm tra xem tin nhắn đã tồn tại chưa
            if (messages.some((m) => m.id === data.id)) {
              return
            }

            const newMessage = {
              id: data.id,
              text: data.content || data.text || "",
              timestamp: data.timestamp,
              senderId: Number(data.senderId),
              isRead: false,
              conversationId: data.conversationId,
              receiverId: data.receiverId,
              ...(data.fileUrl && {
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                fileName: data.fileName,
              }),
            }

            setMessages((prev) =>
              [...prev, newMessage].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
            )

            // Cập nhật lastMessage trong conversations
            setConversations((prev) =>
              prev.map((conv) => {
                if (conv.id === data.conversationId) {
                  return {
                    ...conv,
                    lastMessage: {
                      id: data.id,
                      text: data.content || data.text || "",
                      timestamp: data.timestamp,
                      isRead: false,
                      senderId: Number(data.senderId),
                    },
                    unreadCount: conv.id === selectedConversation?.id ? 0 : conv.unreadCount + 1,
                  }
                }
                return conv
              }),
            )
          }
        } catch (error) {
          console.error("Error parsing public message:", error)
        }
      })
    }

    stompClient.onStompError = (error) => {
      console.error("WebSocket connection error:", error)
      setIsConnecting(false)
      handleReconnect()
    }
  }

  // Xử lý kết nối lại
  const handleReconnect = () => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`)
        connectWebSocket()
      }, delay)
    } else {
      console.error("Max reconnection attempts reached")
      setIsConnecting(false)
    }
  }

  // Thêm useEffect để tự động cập nhật tin nhắn mỗi 10 giây
  useEffect(() => {
    if (selectedConversation) {
      const intervalId = setInterval(() => {
        loadMessages()
      }, 10000) // 10 giây

      return () => {
        clearInterval(intervalId)
      }
    }
  }, [selectedConversation])

  // Thêm useEffect để xử lý cuộn
  useEffect(() => {
    if (shouldScroll && messages.length > 0) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
        setShouldScroll(false)
      }, 100)
    }
  }, [messages, shouldScroll])

  useEffect(() => {
    // Check if there's a user to message directly from profile page
    const messageUserData = sessionStorage.getItem("messageUser")
    if (messageUserData) {
      try {
        const userData = JSON.parse(messageUserData)
        if (userData.openChatDirectly) {
          // Find if there's an existing conversation with this user
          const existingConversation = conversations.find((conv) => conv.user.id === userData.id)

          if (existingConversation) {
            // If conversation exists, select it
            handleSelectConversation(existingConversation)
          } else {
            // If no existing conversation, create a new one
            const newConversation: Conversation = {
              id: Date.now(),
              user: {
                id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                avatar: userData.avatar,
                isOnline: false,
              },
              lastMessage: {
                id: 0,
                text: "Bắt đầu cuộc trò chuyện",
                timestamp: new Date().toISOString(),
                isRead: true,
                senderId: currentUser?.id || 0,
              },
              unreadCount: 0,
            }

            // Add to conversations and select it
            setConversations((prev) => [newConversation, ...prev])
            handleSelectConversation(newConversation)
          }

          // Clear the sessionStorage after processing
          sessionStorage.removeItem("messageUser")
        }
      } catch (error) {
        console.error("Error parsing messageUser data:", error)
        sessionStorage.removeItem("messageUser")
      }
    }
  }, [conversations, currentUser])

  return (
    <BasePage>
      <Box
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Grid container sx={{ height: "100%" }}>
          {/* Danh sách cuộc trò chuyện */}
          {(!isMobile || !showMobileChat) && (
            <Grid
              item
              xs={12}
              md={4}
              lg={3}
              sx={{
                height: "100%",
                borderRight: "1px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
              />
            </Grid>
          )}

          {/* Khu vực chat */}
          {(!isMobile || showMobileChat) && (
            <Grid
              item
              xs={12}
              md={8}
              lg={9}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* {isMobile && <MobileChatHeader conversation={selectedConversation} onBack={handleBackToList} />} */}
              {selectedConversation ? (
                <ChatArea
                  conversation={selectedConversation}
                  messages={messages}
                  currentUserId={currentUser?.id || 0}
                  onSendMessage={handleSendMessage}
                  messagesEndRef={messagesEndRef}
                  ws={ws}
                  showEmojiPicker={showEmojiPicker}
                  onEmojiClick={handleEmojiClick}
                  toggleEmojiPicker={toggleEmojiPicker}
                  isUploading={isUploading}
                  truncateFileName={truncateFileName}
                />
              ) : (
                <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    Chọn một cuộc trò chuyện để bắt đầu
                  </Typography>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Box>
    </BasePage>
  )
}

export default MessagesPage
