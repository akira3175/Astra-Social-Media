import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Paper,
} from "@mui/material"
import FriendCard from "./FriendCard"
import type { FriendStatus } from "./FriendCard"
import { People } from "@mui/icons-material"

// Mock data for friends
const MOCK_FRIENDS = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=1",
    email: "nguyenvana@example.com",
    mutualFriends: 15,
    status: "friend" as FriendStatus,
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://i.pravatar.cc/150?img=5",
    email: "tranthib@example.com",
    mutualFriends: 8,
    status: "friend" as FriendStatus,
  },
  {
    id: 3,
    name: "Lê Văn C",
    avatar: "https://i.pravatar.cc/150?img=8",
    email: "levanc@example.com",
    mutualFriends: 12,
    status: "friend" as FriendStatus,
  },
  {
    id: 4,
    name: "Phạm Thị D",
    avatar: "https://i.pravatar.cc/150?img=10",
    email: "phamthid@example.com",
    mutualFriends: 5,
    status: "friend" as FriendStatus,
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    avatar: "https://i.pravatar.cc/150?img=11",
    email: "hoangvane@example.com",
    mutualFriends: 3,
    status: "friend" as FriendStatus,
  },
  {
    id: 6,
    name: "Ngô Thị F",
    avatar: "https://i.pravatar.cc/150?img=12",
    email: "ngothif@example.com",
    mutualFriends: 7,
    status: "friend" as FriendStatus,
  },
  {
    id: 7,
    name: "Đỗ Văn G",
    avatar: "https://i.pravatar.cc/150?img=13",
    email: "dovang@example.com",
    mutualFriends: 2,
    status: "friend" as FriendStatus,
  },
  {
    id: 8,
    name: "Vũ Thị H",
    avatar: "https://i.pravatar.cc/150?img=14",
    email: "vuthih@example.com",
    mutualFriends: 9,
    status: "friend" as FriendStatus,
  },
]

interface FriendsListProps {
  searchQuery?: string
}

const FriendsList: React.FC<FriendsListProps> = ({ searchQuery = "" }) => {
  const [friends, setFriends] = useState(MOCK_FRIENDS)
  const [filteredFriends, setFilteredFriends] = useState(MOCK_FRIENDS)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("name")
  const friendsPerPage = 8

  // Filter and sort friends when search query or sort option changes
  useEffect(() => {
    setIsLoading(true)

    // Filter by search query
    let filtered = friends
    if (searchQuery) {
      filtered = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Sort friends
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "mutual") {
        return b.mutualFriends - a.mutualFriends
      }
      return 0
    })

    setFilteredFriends(filtered)
    setPage(1)
    setIsLoading(false)
  }, [searchQuery, sortBy, friends])

  // Handle page change
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value)
  }

  // Handle friend actions
  const handleRemoveFriend = (id: number) => {
    setFriends(friends.filter((friend) => friend.id !== id))
  }

  const handleMessageFriend = (id: number) => {
    console.log(`Message friend with ID: ${id}`)
    // Implement message functionality
  }

  const handleBlockFriend = (id: number) => {
    console.log(`Block friend with ID: ${id}`)
    setFriends(friends.filter((friend) => friend.id !== id))
    // Implement block functionality
  }

  // Calculate pagination
  const indexOfLastFriend = page * friendsPerPage
  const indexOfFirstFriend = indexOfLastFriend - friendsPerPage
  const currentFriends = filteredFriends.slice(indexOfFirstFriend, indexOfLastFriend)
  const totalPages = Math.ceil(filteredFriends.length / friendsPerPage)

  return (
    <Box>
      {/* Header with count and sort */}
      <Paper sx={{ p: 2, mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          <People sx={{ mr: 1 }} />
          {filteredFriends.length} bạn bè
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="sort-select-label">Sắp xếp theo</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={sortBy}
            label="Sắp xếp theo"
            onChange={handleSortChange}
          >
            <MenuItem value="name">Tên</MenuItem>
            <MenuItem value="mutual">Bạn chung</MenuItem>
          </Select>
        </FormControl>
      </Paper>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : filteredFriends.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h6" gutterBottom>
            Không tìm thấy bạn bè
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? `Không có kết quả cho "${searchQuery}"` : "Bạn chưa có bạn bè nào."}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentFriends.map((friend) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={friend.id}>
                <FriendCard
                  {...friend}
                  onRemove={handleRemoveFriend}
                  onMessage={handleMessageFriend}
                  onBlock={handleBlockFriend}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default FriendsList
