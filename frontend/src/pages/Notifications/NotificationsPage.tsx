import React, { useRef, useEffect } from "react"
import { Box, Container, Typography, List, Divider, Button, CircularProgress, Paper, IconButton } from "@mui/material"
import { MarkChatRead } from "@mui/icons-material"
import BasePage from "../Base/BasePage"
import NotificationItem from "../../components/Notifications/NotificationItem"
import { useNotifications } from "../../contexts/NotificationContext"

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications()
  const listRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
        loadMore()
      }
    }
  }

  // Add scroll event listener
  useEffect(() => {
    const listElement = listRef.current
    if (listElement) {
      listElement.addEventListener("scroll", handleScroll)
      return () => {
        listElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [hasMore, loading])

  return (
    <BasePage>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              Thông báo
              {unreadCount > 0 && (
                <Typography component="span" variant="body2" color="error" sx={{ ml: 1, fontWeight: "normal" }}>
                  ({unreadCount} chưa đọc)
                </Typography>
              )}
            </Typography>
            {unreadCount > 0 && (
              <IconButton size="small" onClick={() => markAllAsRead()} title="Đánh dấu tất cả là đã đọc">
                <MarkChatRead />
              </IconButton>
            )}
          </Box>

          <Box
            ref={listRef}
            sx={{
              maxHeight: "calc(100vh - 180px)",
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                borderRadius: "4px",
              },
            }}
          >
            {loading && notifications.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  Không có thông báo nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bạn chưa có thông báo nào.
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {notifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <NotificationItem notification={notification} onMarkAsRead={markAsRead} />
                    <Divider component="li" />
                  </React.Fragment>
                ))}

                {loading && (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}

                {error && (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="error" variant="body2" paragraph>
                      {error}
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => refreshNotifications()}>
                      Thử lại
                    </Button>
                  </Box>
                )}
              </List>
            )}
          </Box>
        </Paper>
      </Container>
    </BasePage>
  )
}

export default NotificationsPage
