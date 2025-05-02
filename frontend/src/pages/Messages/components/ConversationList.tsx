"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  alpha,
} from "@mui/material"
import { Search, Edit, MoreVert } from "@mui/icons-material"
import type { ChatUser, Conversation } from "../../../types/message"
import { useCurrentUser } from "../../../contexts/currentUserContext"

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: number
  onSelectConversation: (conversation: Conversation) => void
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedId, onSelectConversation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<ChatUser[]>([])
  const { currentUser } = useCurrentUser()

  const formatLastMessageTime = (timestamp: string) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return "Vừa xong";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút`;
    } else if (diffInMinutes < 24 * 60) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} giờ`;
    } else if (diffInMinutes < 48 * 60) {
      return "Hôm qua";
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  // Lấy danh sách người dùng từ API
  const loadUsers = () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !currentUser?.id) {
      console.log('User not logged in');
      return;
    }

    fetch(`http://localhost:8080/api/chat/users/${currentUser.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
            return;
          }
          if (res.status === 400) {
            throw new Error('Invalid request');
          }
          if (res.status === 404) {
            setUsers([]);
            return;
          }
          throw new Error(`Network response was not ok: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          console.log("Loaded chat users:", data);
          setUsers(data);
        }
      })
      .catch(error => {
        console.error('Error fetching chat users:', error);
        setUsers([]);
      });
  };

  // Tải danh sách người dùng khi component mount
  useEffect(() => {
    loadUsers();
    // Cập nhật danh sách người dùng mỗi 5 giây
    const interval = setInterval(loadUsers, 5000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Kết hợp danh sách cuộc trò chuyện với danh sách người dùng
  const combinedConversations = conversations.map(conversation => {
    const user = users.find(u => u.id === conversation.user.id);
    return {
      ...conversation,
      user: {
        ...conversation.user,
        name: user?.name || `${conversation.user.firstName} ${conversation.user.lastName}`,
        avatar: user?.avatar || conversation.user.avatar,
        lastMessage: user?.lastMessage || conversation.lastMessage.text,
        lastMessageTime: user?.lastMessageTime || conversation.lastMessage.timestamp,
        unreadCount: user?.unreadCount || conversation.unreadCount
      }
    };
  });

  // Thêm các người dùng chưa có trong danh sách cuộc trò chuyện
  const newUsers = users.filter(user =>
    !conversations.some(conv => conv.user.id.toString() === user.id)
  ).map(user => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    user: {
      id: parseInt(user.id),
      name: user.name,
      avatar: user.avatar,
      lastMessage: user.lastMessage,
      lastMessageTime: user.lastMessageTime,
      unreadCount: user.unreadCount
    },
    lastMessage: {
      id: 0,
      text: user.lastMessage || "Chưa có tin nhắn nào",
      timestamp: user.lastMessageTime || new Date().toISOString(),
      isRead: true,
      senderId: 0
    }
  }));

  const allConversations = [...combinedConversations, ...newUsers];

  const filteredConversations = allConversations.filter(
    (conversation) =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Header phần tin nhắn */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Tin nhắn
        </Typography>
        <IconButton color="primary" size="small">
          <Edit />
        </IconButton>
      </Box>

      {/* Phần tìm kiếm */}
      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm tin nhắn"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
            },
          }}
        />
      </Box>

      <Divider />

      {/* Phần danh sách có thể scroll */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <List
          sx={{
            overflow: "auto",
            height: "100%",
            px: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              },
            },
          }}
        >
          {filteredConversations.length === 0 ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Không tìm thấy cuộc trò chuyện nào
              </Typography>
            </Box>
          ) : (
            filteredConversations.map((conversation) => (
              <ListItem
                key={conversation.id}
                disablePadding
                secondaryAction={
                  <IconButton edge="end" size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={selectedId === conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1,
                    "&.Mui-selected": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      "&:hover": {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      variant="dot"
                      color="success"
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
                        src={conversation.user.avatar ? `http://localhost:8080${conversation.user.avatar}` : undefined}
                        alt={conversation.user.name}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: !conversation.user.avatar ? 'primary.main' : 'transparent'
                        }}
                      >
                        {!conversation.user.avatar && conversation.user.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: conversation.user.unreadCount > 0 ? 600 : 400,
                          color: conversation.user.unreadCount > 0 ? "text.primary" : "text.primary",
                        }}
                      >
                        {conversation.user.name}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: conversation.user.unreadCount > 0 ? "text.primary" : "text.secondary",
                            fontWeight: conversation.user.unreadCount > 0 ? 500 : 400,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "120px",
                          }}
                        >
                          {conversation.user.lastMessage}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: conversation.user.unreadCount > 0 ? "text.primary" : "text.secondary",
                              ml: 1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatLastMessageTime(conversation.user.lastMessageTime)}
                          </Typography>
                          {conversation.user.unreadCount > 0 && (
                            <Badge
                              badgeContent={conversation.user.unreadCount}
                              color="primary"
                              sx={{ ml: 1, "& .MuiBadge-badge": { fontSize: "0.6rem" } }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Box>
  )
}

export default ConversationList
