"use client"

import type React from "react"
import { useState } from "react"
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

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: number
  onSelectConversation: (conversation: Conversation) => void
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedId, onSelectConversation }) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Tin nhắn
        </Typography>
        <IconButton color="primary" size="small">
          <Edit />
        </IconButton>
      </Box>

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

      <List sx={{ overflow: "auto", flexGrow: 1, px: 1 }}>
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
                    <Avatar src={conversation.user.avatar} alt={conversation.user.name} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                        color: conversation.unreadCount > 0 ? "text.primary" : "text.primary",
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
                          color: conversation.unreadCount > 0 ? "text.primary" : "text.secondary",
                          fontWeight: conversation.unreadCount > 0 ? 500 : 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "120px",
                        }}
                      >
                        {conversation.lastMessage.senderId === 999 ? "Bạn: " : ""}
                        {conversation.lastMessage.text}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: conversation.unreadCount > 0 ? "text.primary" : "text.secondary",
                            ml: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conversation.lastMessage.timestamp}
                        </Typography>
                        {conversation.unreadCount > 0 && (
                          <Badge
                            badgeContent={conversation.unreadCount}
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
    </>
  )
}

export default ConversationList
