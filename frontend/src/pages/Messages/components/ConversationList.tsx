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
import type { Conversation } from "../../../types/message"
import { useCurrentUser } from "../../../contexts/currentUserContext"
import messageService from "../../../services/messageService"
import { User } from "../../../types/user"

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: number
  onSelectConversation: (conversation: Conversation) => void
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedId, onSelectConversation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
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
  const loadUsers = async () => {
    const response = await messageService.getChatUsers();
    setUsers(response);
  };

  // Tải danh sách người dùng khi component mount
  useEffect(() => {
    loadUsers();
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
    !conversations.some(conv => conv.user.id === user.id)
  ).map(user => ({
    id: Date.now() + Math.floor(Math.random() * 1000),
    user: {
      id: user.id,
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
                  onClick={() => onSelectConversation(conversation as unknown as Conversation)}
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
                        src={conversation.user.avatar ? conversation.user.avatar : undefined}
                        alt={conversation.user.avatar}
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
