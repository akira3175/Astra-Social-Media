import type React from "react"
import { useState, useEffect } from "react"
import { Box, Grid, Typography, CircularProgress, Paper, Button } from "@mui/material"
import FriendCard from "./FriendCard"
import type { FriendStatus } from "./FriendCard"
import { Refresh, PersonAdd } from "@mui/icons-material"

// Mock data for friend suggestions
const MOCK_FRIEND_SUGGESTIONS = [
  {
    id: 201,
    name: "Phan Văn M",
    avatar: "https://i.pravatar.cc/150?img=30",
    email: "phanvanm@example.com",
    mutualFriends: 6,
    status: "suggestion" as FriendStatus,
  },
  {
    id: 202,
    name: "Lý Thị N",
    avatar: "https://i.pravatar.cc/150?img=31",
    email: "lythin@example.com",
    mutualFriends: 3,
    status: "suggestion" as FriendStatus,
  },
  {
    id: 203,
    name: "Hồ Văn O",
    avatar: "https://i.pravatar.cc/150?img=32",
    email: "hovano@example.com",
    mutualFriends: 8,
    status: "suggestion" as FriendStatus,
  },
  {
    id: 204,
    name: "Đinh Thị P",
    avatar: "https://i.pravatar.cc/150?img=33",
    email: "dinhthip@example.com",
    mutualFriends: 5,
    status: "suggestion" as FriendStatus,
  },
  {
    id: 205,
    name: "Huỳnh Văn Q",
    avatar: "https://i.pravatar.cc/150?img=34",
    email: "huynhvanq@example.com",
    mutualFriends: 2,
    status: "suggestion" as FriendStatus,
  },
  {
    id: 206,
    name: "Mai Thị R",
    avatar: "https://i.pravatar.cc/150?img=35",
    email: "maithir@example.com",
    mutualFriends: 4,
    status: "suggestion" as FriendStatus,
  },
  {
    id: 207,
    name: "Dương Văn S",
    avatar: "https://i.pravatar.cc/150?img=36",
    email: "duongvans@example.com",
    mutualFriends: 7,
    status: "suggestion" as FriendStatus,
  },
  {
    id: 208,
    name: "Võ Thị T",
    avatar: "https://i.pravatar.cc/150?img=37",
    email: "vothit@example.com",
    mutualFriends: 1,
    status: "suggestion" as FriendStatus,
  },
]

const FriendSuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState(MOCK_FRIEND_SUGGESTIONS)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate loading
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Handle add friend
  const handleAddFriend = (id: number) => {
    console.log(`Add friend with ID: ${id}`)
    setSuggestions(suggestions.filter((suggestion) => suggestion.id !== id))
    // Implement add friend functionality
  }

  // Handle refresh suggestions
  const handleRefreshSuggestions = () => {
    setIsRefreshing(true)
    // Simulate API call to refresh suggestions
    setTimeout(() => {
      // Shuffle the suggestions array to simulate new suggestions
      setSuggestions([...suggestions].sort(() => Math.random() - 0.5))
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
            <PersonAdd sx={{ mr: 1 }} />
            Gợi ý kết bạn
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dựa trên bạn bè chung và sở thích của bạn
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefreshSuggestions} disabled={isRefreshing}>
          {isRefreshing ? "Đang làm mới..." : "Làm mới"}
        </Button>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : suggestions.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            Không có gợi ý kết bạn nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy quay lại sau để xem thêm gợi ý kết bạn.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {suggestions.map((suggestion) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={suggestion.id}>
              <FriendCard {...suggestion} onAdd={handleAddFriend} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default FriendSuggestions
