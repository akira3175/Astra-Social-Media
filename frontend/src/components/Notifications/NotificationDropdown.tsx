import { useState, useRef, useEffect, useCallback } from "react"
import type { MouseEvent } from "react"
import {
  Badge,
  IconButton,
  Popover,
  Typography,
  Box,
  List,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { Notifications as NotificationsIcon, MarkChatRead } from "@mui/icons-material"
import { Link } from "react-router-dom"
import NotificationItem from "./NotificationItem"
import { useNotifications } from "../../contexts/NotificationContext"

const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const { notifications, unreadCount, loading, error, hasMore, loadMore, markAsRead, markAllAsRead } =
    useNotifications()
  const listRef = useRef<HTMLUListElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const open = Boolean(anchorEl)
  const popoverId = open ? "notifications-popover" : undefined

  // console.log("notifications", notifications)

  // Event handlers
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  // Memoize the scroll handler to prevent unnecessary re-renders
  const handleScroll = useCallback(() => {
    if (!listRef.current || !hasMore || loading) return

    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    // Load more when user scrolls to 80% of the list
    if (scrollHeight - scrollTop <= clientHeight * 1.2) {
      loadMore()
    }
  }, [hasMore, loading, loadMore])

  // Set up scroll event listener
  useEffect(() => {
    const listElement = listRef.current
    if (!listElement) return

    listElement.addEventListener("scroll", handleScroll)
    return () => {
      listElement.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  return (
    <>
      <IconButton
        aria-describedby={popoverId}
        onClick={handleClick}
        color="primary"
        aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: isMobile ? "100%" : 360,
            maxWidth: "100%",
            maxHeight: "80vh",
            borderRadius: 2,
            boxShadow: 3,
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold">
            Thông báo
          </Typography>
          {unreadCount > 0 && (
            <IconButton size="small" onClick={() => markAllAsRead()} aria-label="Đánh dấu tất cả là đã đọc">
              <MarkChatRead fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Divider />

        <List
          component="ul"
          ref={listRef}
          sx={{
            maxHeight: 400,
            overflowY: "auto",
            overflowX: "hidden",
            p: 0,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "4px",
            },
          }}
          aria-live="polite"
        >
          {notifications.length === 0 && !loading && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">Không có thông báo nào</Typography>
            </Box>
          )}

          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              compact={true}
            />
          ))}

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress size={24} aria-label="Đang tải thông báo" />
            </Box>
          )}

          {error && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography color="error" variant="body2">
                {error}
              </Typography>
              <Button variant="text" size="small" onClick={() => loadMore()} sx={{ mt: 1 }}>
                Thử lại
              </Button>
            </Box>
          )}
        </List>

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button fullWidth component={Link} to="/notifications" onClick={handleClose} sx={{ textTransform: "none" }}>
            Xem tất cả thông báo
          </Button>
        </Box>
      </Popover>
    </>
  )
}

export default NotificationDropdown
