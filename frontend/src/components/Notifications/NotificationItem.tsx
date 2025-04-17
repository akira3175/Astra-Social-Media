import type React from "react"
import { ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, useTheme } from "@mui/material"
import { Favorite, Comment, PersonAdd, Check, MoreHoriz, Circle } from "@mui/icons-material"
import { Link } from "react-router-dom"
import type { Notification } from "../../contexts/NotificationContext"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
  compact?: boolean
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, compact = false }) => {
  const theme = useTheme()

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }

    // Navigate to the appropriate page based on notification type
    // This will be handled by the Link component
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "LIKE":
        return (
          <Box
            sx={{
              bgcolor: theme.palette.primary.main,
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3px",
            }}
          >
            <Favorite sx={{ color: "white", fontSize: compact ? 16 : 20 }} />
          </Box>
        )
      case "COMMENT":
        return (
          <Box
            sx={{
              bgcolor: "#1877f2",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3px",
            }}
          >
            <Comment sx={{ color: "white", fontSize: compact ? 16 : 20 }} />
          </Box>
        )
      case "FRIEND_REQUEST":
        return (
          <Box
            sx={{
              bgcolor: "#0096ff",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3px",
            }}
          >
            <PersonAdd sx={{ color: "white", fontSize: compact ? 16 : 20 }} />
          </Box>
        )
      case "FRIEND_ACCEPT":
        return (
          <Box
            sx={{
              bgcolor: "#1ed760",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3px",
            }}
          >
            <Check sx={{ color: "white", fontSize: compact ? 16 : 20 }} />
          </Box>
        )
      default:
        return (
          <Box
            sx={{
              bgcolor: "#1877f2",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3px",
            }}
          >
            <MoreHoriz sx={{ color: "white", fontSize: compact ? 16 : 20 }} />
          </Box>
        )
    }
  }

  const getNotificationLink = () => {
    switch (notification.type) {
      case "LIKE":
      case "COMMENT":
        return notification.postId ? `/post/${notification.postId}` : "/"
      case "FRIEND_REQUEST":
      case "FRIEND_ACCEPT":
        return `/profile/${notification.senderId}`
      default:
        return "/"
    }
  }

  const getTimeAgo = () => {
    if (!notification.createdAt) return "Vừa xong"

    try {
      return formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: vi,
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Vừa xong"
    }
  }

  return (
    <ListItem
      component={Link}
      to={getNotificationLink()}
      onClick={handleClick}
      alignItems="flex-start"
      sx={{
        py: compact ? 1 : 1.5,
        px: compact ? 1 : 2,
        borderRadius: 1,
        mb: 0.5,
        textDecoration: "none",
        color: "inherit",
        bgcolor: notification.isRead ? "transparent" : "action.hover",
        "&:hover": {
          bgcolor: "action.selected",
        },
        position: "relative",
      }}
    >
      {!notification.isRead && (
        <Circle
          sx={{
            position: "absolute",
            top: compact ? 8 : 12,
            left: compact ? 4 : 8,
            color: theme.palette.primary.main,
            fontSize: 12,
          }}
        />
      )}

      <ListItemAvatar sx={{ mt: 0, position: "relative" }}>
        <Avatar
          src={notification.senderAvatarUrl}
          alt={notification.senderName}
          sx={{
            width: compact ? 40 : 48,
            height: compact ? 40 : 48,
            position: "relative",
          }}
        >
          {notification.senderName.charAt(0)}
        </Avatar>
        <Box
          sx={{
            position: "absolute",
            bottom: compact ? -4 : 0,
            right: compact ? 10 : 0,
            width: compact ? 20 : 24,
            height: compact ? 20 : 24,
          }}
        >
          {getNotificationIcon()}
        </Box>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Typography
            variant={compact ? "body2" : "body1"}
            component="div"
            sx={{
              fontWeight: notification.isRead ? "normal" : "medium",
              pr: 2,
            }}
          >
            {notification.message}
          </Typography>
        }
        secondary={
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 0.5,
            }}
          >
            {getTimeAgo()}
          </Typography>
        }
      />
    </ListItem>
  )
}

export default NotificationItem
