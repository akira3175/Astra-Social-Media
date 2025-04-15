import type React from "react"
import { useState, useEffect } from "react"
import { Box, Grid, Typography, CircularProgress, Paper } from "@mui/material"
import FriendCard from "./FriendCard"
import type { FriendStatus } from "./FriendCard"
import { PersonAdd } from "@mui/icons-material"

// Mock data for friend requests
const MOCK_FRIEND_REQUESTS = [
  {
    id: 101,
    name: "Đặng Văn I",
    avatar: "https://i.pravatar.cc/150?img=20",
    email: "dangvani@example.com",
    mutualFriends: 4,
    status: "request" as FriendStatus,
  },
  {
    id: 102,
    name: "Bùi Thị K",
    avatar: "https://i.pravatar.cc/150?img=21",
    email: "buithik@example.com",
    mutualFriends: 7,
    status: "request" as FriendStatus,
  },
  {
    id: 103,
    name: "Trương Văn L",
    avatar: "https://i.pravatar.cc/150?img=22",
    email: "truongvanl@example.com",
    mutualFriends: 2,
    status: "request" as FriendStatus,
  },
]

const FriendRequests: React.FC = () => {
  const [requests, setRequests] = useState(MOCK_FRIEND_REQUESTS)
  const [isLoading, setIsLoading] = useState(false)

  // Simulate loading
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Handle accept friend request
  const handleAcceptRequest = (id: number) => {
    console.log(`Accept friend request with ID: ${id}`)
    setRequests(requests.filter((request) => request.id !== id))
    // Implement accept functionality
  }

  // Handle reject friend request
  const handleRejectRequest = (id: number) => {
    console.log(`Reject friend request with ID: ${id}`)
    setRequests(requests.filter((request) => request.id !== id))
    // Implement reject functionality
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <PersonAdd sx={{ mr: 1 }} />
          Lời mời kết bạn
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {requests.length} lời mời đang chờ xác nhận
        </Typography>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            Không có lời mời kết bạn nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn sẽ nhận được thông báo khi có người gửi lời mời kết bạn.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={request.id}>
              <FriendCard {...request} onAccept={handleAcceptRequest} onReject={handleRejectRequest} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default FriendRequests
