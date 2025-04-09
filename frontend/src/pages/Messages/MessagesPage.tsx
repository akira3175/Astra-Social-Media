import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material"
import BasePage from "../Base/BasePage"
import ConversationList from "./components/ConversationList"
import ChatArea from "./components/ChatArea"
import MobileChatHeader from "./components/MobileChatHeader"
import { useCurrentUser } from "../../contexts/currentUserContext"
import type { Conversation, Message } from "../../types/message"
import type { User } from "../../types/user"

// Dữ liệu mẫu cho các cuộc trò chuyện
const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    user: {
      id: 101,
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=1",
      isOnline: true,
      email: ""
    },
    lastMessage: {
      id: 1001,
      text: "Bạn đã xem tài liệu tôi gửi chưa?",
      timestamp: "10:30",
      isRead: true,
      senderId: 101,
    },
    unreadCount: 0,
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?img=5",
      isOnline: true,
      email: ""
    },
    lastMessage: {
      id: 1002,
      text: "Hẹn gặp lại vào ngày mai nhé!",
      timestamp: "Hôm qua",
      isRead: false,
      senderId: 102,
    },
    unreadCount: 3,
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?img=8",
      isOnline: false,
      email: ""
    },
    lastMessage: {
      id: 1003,
      text: "Cảm ơn bạn rất nhiều!",
      timestamp: "Thứ 2",
      isRead: true,
      senderId: 103,
    },
    unreadCount: 0,
  },
  {
    id: 4,
    user: {
      id: 104,
      name: "Phạm Thị D",
      avatar: "https://i.pravatar.cc/150?img=10",
      isOnline: false,
      email: ""
    },
    lastMessage: {
      id: 1004,
      text: "Bạn có thể gửi cho tôi file đó được không?",
      timestamp: "25/03",
      isRead: true,
      senderId: 104,
    },
    unreadCount: 0,
  },
  {
    id: 5,
    user: {
      id: 105,
      name: "Hoàng Văn E",
      avatar: "https://i.pravatar.cc/150?img=11",
      isOnline: true,
      email: ""
    },
    lastMessage: {
      id: 1005,
      text: "Tôi sẽ gửi email cho bạn sau.",
      timestamp: "20/03",
      isRead: true,
      senderId: 999, // Current user
    },
    unreadCount: 0,
  },
]

// Dữ liệu mẫu cho các tin nhắn trong một cuộc trò chuyện
const SAMPLE_MESSAGES: Record<number, Message[]> = {
  1: [
    {
      id: 1,
      text: "Chào bạn, bạn khỏe không?",
      timestamp: "10:00",
      senderId: 101,
      isRead: true,
    },
    {
      id: 2,
      text: "Tôi khỏe, cảm ơn bạn! Còn bạn thì sao?",
      timestamp: "10:05",
      senderId: 999, // Current user
      isRead: true,
    },
    {
      id: 3,
      text: "Tôi cũng khỏe. Tôi đã gửi cho bạn một tài liệu qua email, bạn kiểm tra giúp tôi nhé.",
      timestamp: "10:10",
      senderId: 101,
      isRead: true,
    },
    {
      id: 4,
      text: "Tôi sẽ kiểm tra ngay bây giờ.",
      timestamp: "10:15",
      senderId: 999, // Current user
      isRead: true,
    },
    {
      id: 5,
      text: "Bạn đã xem tài liệu tôi gửi chưa?",
      timestamp: "10:30",
      senderId: 101,
      isRead: true,
    },
  ],
  2: [
    {
      id: 1,
      text: "Chào bạn, ngày mai chúng ta có cuộc họp lúc mấy giờ nhỉ?",
      timestamp: "Hôm qua, 15:30",
      senderId: 999, // Current user
      isRead: true,
    },
    {
      id: 2,
      text: "Chào bạn, cuộc họp sẽ bắt đầu lúc 9 giờ sáng.",
      timestamp: "Hôm qua, 15:45",
      senderId: 102,
      isRead: true,
    },
    {
      id: 3,
      text: "Cảm ơn bạn. Tôi sẽ chuẩn bị tài liệu.",
      timestamp: "Hôm qua, 16:00",
      senderId: 999, // Current user
      isRead: true,
    },
    {
      id: 4,
      text: "Tuyệt vời! Bạn nhớ mang theo bản báo cáo quý 2 nhé.",
      timestamp: "Hôm qua, 16:15",
      senderId: 102,
      isRead: true,
    },
    {
      id: 5,
      text: "Hẹn gặp lại vào ngày mai nhé!",
      timestamp: "Hôm qua, 16:30",
      senderId: 102,
      isRead: false,
    },
    {
      id: 6,
      text: "Bạn có cần tôi chuẩn bị thêm gì không?",
      timestamp: "Hôm qua, 17:00",
      senderId: 102,
      isRead: false,
    },
    {
      id: 7,
      text: "Nhớ mang theo laptop nhé!",
      timestamp: "Hôm qua, 17:30",
      senderId: 102,
      isRead: false,
    },
  ],
}

const MessagesPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const currentUser = useCurrentUser()
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [showMobileChat, setShowMobileChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null!)

  // Chọn cuộc trò chuyện đầu tiên khi trang được tải
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      handleSelectConversation(conversations[0])
    }
  }, [conversations])

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    
    // Lấy tin nhắn cho cuộc trò chuyện được chọn
    const conversationMessages = SAMPLE_MESSAGES[conversation.id] || []
    setMessages(conversationMessages)
    
    // Đánh dấu tin nhắn là đã đọc
    if (conversation.unreadCount > 0) {
      const updatedConversations = conversations.map(conv => 
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
      setConversations(updatedConversations)
    }
    
    // Hiển thị khu vực chat trên mobile
    if (isMobile) {
      setShowMobileChat(true)
    }
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
  }

  const handleSendMessage = (text: string) => {
    if (!selectedConversation || !text.trim()) return

    // Tạo tin nhắn mới
    const newMessage: Message = {
      id: Date.now(),
      text,
      timestamp: "Vừa xong",
      senderId: currentUser?.id || 999, // Current user
      isRead: false,
    }

    // Cập nhật danh sách tin nhắn
    setMessages([...messages, newMessage])

    // Cập nhật cuộc trò chuyện với tin nhắn mới nhất
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            lastMessage: {
              id: newMessage.id,
              text: newMessage.text,
              timestamp: newMessage.timestamp,
              isRead: newMessage.isRead,
              senderId: newMessage.senderId,
            } 
          } 
        : conv
    )
    setConversations(updatedConversations)
  }

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
              {isMobile && (
                <MobileChatHeader
                  conversation={selectedConversation}
                  onBack={handleBackToList}
                />
              )}
              <ChatArea
                conversation={selectedConversation}
                messages={messages}
                currentUserId={currentUser?.id || 999}
                onSendMessage={handleSendMessage}
                messagesEndRef={messagesEndRef}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </BasePage>
  )
}

export default MessagesPage
