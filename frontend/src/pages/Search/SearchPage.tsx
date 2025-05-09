"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material"
import { Person, Article, FilterAlt } from "@mui/icons-material"

import { useLocation } from "react-router-dom"
import BasePage from "../Base/BasePage"
import UserList from "./components/UserList"
import PostList from "../Home/components/PostList"
import type { User } from "../../types/user"
import UserService from "../../services/userService"
import { PostService } from "../../services/PostService"
import type { Post } from "../../types/post"

const SEARCH_FILTERS = [
  { id: "all", label: "Tất cả", icon: <FilterAlt /> },
  { id: "people", label: "Mọi người", icon: <Person /> },
  { id: "posts", label: "Bài viết", icon: <Article /> },
]

const SearchPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [activeFilter, setActiveFilter] = useState("all") // all, people, posts, etc.
  const [isLoading, setIsLoading] = useState(false)
  // const [friendIds, setFriendIds] = useState<number[]>([])
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    type: "success" | "error" | "info"
  }>({
    open: false,
    message: "",
    type: "info",
  })

  // Lấy query từ URL
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.get("q") || ""

  // Thực hiện tìm kiếm khi query thay đổi
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        // If no search query, load some initial data
        await fetchInitialData()
        return
      }

      setIsLoading(true)
      try {
        // If we have a search query, search for both users and posts
        if (activeFilter === "all" || activeFilter === "people") {
          await searchUsers()
        } else {
          setUsers([])
        }

        if (activeFilter === "all" || activeFilter === "posts") {
          await searchPosts()
        } else {
          setPosts([])
        }
      } catch (error) {
        console.error("Error searching:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [searchQuery, activeFilter])

  const searchUsers = async () => {
    try {
      const response = await UserService.searchUsers(searchQuery, false, true, 0, 10)
      setUsers(response)
    } catch (error) {
      console.error("Error searching users:", error)
      setUsers([])
    }
  }

  const searchPosts = async () => {
    try {
      const response = await PostService.searchPost({
        keyword: searchQuery,
        page: 0,
        size: 10,
      })
      setPosts(response || [])
    } catch (error) {
      console.error("Error searching posts:", error)
      setPosts([])
    }
  }

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      // Load some initial data when there's no search query
      if (activeFilter === "all" || activeFilter === "people") {
        const usersResponse = await UserService.searchUsers("", false, true, 0, 5)
        setUsers(usersResponse)
      } else {
        setUsers([])
      }

      if (activeFilter === "all" || activeFilter === "posts") {
        const postsResponse = await PostService.getPosts({
          page: 0,
          size: 5,
          sortBy: "createdAt",
          sortDirection: "desc",
        })
        setPosts(postsResponse.content || [])
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error("Error fetching initial data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
  }

  // Xử lý kết bạn
  // const handleAddFriend = (userId: number) => {
  //   if (friendIds.includes(userId)) {
  //     // Nếu đã là bạn, hủy kết bạn
  //     setFriendIds(friendIds.filter((id) => id !== userId))
  //     setNotification({
  //       open: true,
  //       message: "Đã hủy kết bạn",
  //       type: "info",
  //     })
  //   } else {
  //     // Nếu chưa là bạn, thêm bạn
  //     setFriendIds([...friendIds, userId])
  //     setNotification({
  //       open: true,
  //       message: "Đã gửi lời mời kết bạn",
  //       type: "success",
  //     })
  //   }
  // }

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    })
  }

  const renderSearchResults = () => {

    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (
      (activeFilter === "all" && users.length === 0 && posts.length === 0) ||
      (activeFilter === "people" && users.length === 0) ||
      (activeFilter === "posts" && posts.length === 0)
    ) {
      return (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy kết quả nào {searchQuery && `cho "${searchQuery}"`}
          </Typography>
        </Box>
      )
    }

    if (activeFilter === "all") {
      return (
        <Box>
          {/* Người dùng */}
          {users.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Người dùng</Typography>
              </Box>
              <UserList users={users} isLoading={false} />
            </Box>
          )}

          {/* Bài viết */}
          {posts.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Bài viết</Typography>
              </Box>
              <PostList
                posts={posts.map((post) => ({
                  id: post.id,
                  content: post.content,
                  images: post.images && post.images.length > 0 ? [{ id: post.id, url: post.images[0].url }] : [],
                  createdAt: post.createdAt,
                  updatedAt: post.createdAt,
                  user: {
                    id: post.user.id,
                    firstName: post.user.name.split(" ")[0],
                    lastName: post.user.name.split(" ").slice(1).join(" "),
                    avatar: post.user.avatar,
                    email: post.user.email,
                  },
                  likesCount: post.likesCount,
                  liked: post.liked,
                  commentsCount: post.commentsCount,
                  saved: post.saved,
                  originalPost: post.originalPost,
                  isDeleted: post.deleted,
                }))}
                isLoading={false}
              />
            </Box>
          )}
        </Box>
      )
    }

    if (activeFilter === "people") {
      return <UserList users={users} isLoading={false} />
    }

    if (activeFilter === "posts") {
      return (
        <PostList
          posts={posts.map((post) => ({
            id: post.id,
            content: post.content,
            images: post.images && post.images.length > 0 ? [{ id: post.id, url: post.images[0].url }] : [],
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            user: {
              id: post.user.id,
              firstName: post.user.name.split(" ")[0],
              lastName: post.user.name.split(" ").slice(1).join(" "),
              avatar: post.user.avatar,
              email: post.user.email,
            },
            likesCount: post.likesCount,
            liked: post.liked,
            commentsCount: post.commentsCount,
            saved: post.saved,
            originalPost: post.originalPost,
            isDeleted: post.deleted,
          }))}
          isLoading={false}
        />
      )
    }

    // Các bộ lọc khác (chưa có dữ liệu)
    return (
      <Box sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Chức năng này đang được phát triển
        </Typography>
      </Box>
    )
  }

  return (
    <BasePage>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Nội dung tìm kiếm */}
        <Grid container spacing={3}>
          {/* Sidebar bên trái - Bộ lọc */}
          <Grid item xs={12} md={3} lg={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Bộ lọc tìm kiếm
              </Typography>
              <List component="nav" sx={{ width: "100%" }}>
                {SEARCH_FILTERS.map((filter) => (
                  <ListItem key={filter.id} disablePadding>
                    <ListItemButton
                      selected={activeFilter === filter.id}
                      onClick={() => handleFilterChange(filter.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        "&.Mui-selected": {
                          bgcolor: "primary.lighter",
                          "&:hover": {
                            bgcolor: "primary.lighter",
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: activeFilter === filter.id ? "primary.main" : "inherit",
                        }}
                      >
                        {filter.icon}
                      </ListItemIcon>
                      <ListItemText primary={filter.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Nội dung chính bên phải - Kết quả tìm kiếm */}
          <Grid item xs={12} md={9} lg={9}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Kết quả tìm kiếm {searchQuery && `cho "${searchQuery}"`}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {renderSearchResults()}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Thông báo */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </BasePage>
  )
}

export default SearchPage
