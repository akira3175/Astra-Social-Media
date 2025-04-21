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
import { Person, Article, FilterAlt, Group, Public, Photo, Event, Bookmark } from "@mui/icons-material"
import { useLocation } from "react-router-dom"
import BasePage from "../Base/BasePage"
import UserList from "./components/UserList"
import PostList from "../Home/components/PostList"
import type { User } from "../../types/user"

interface Post {
  id: number
  title: string
  content: string
  image?: string
  author: {
    email: string
    id: number
    name: string
    avatar: string
  }
  date: string
  likes: number
  comments: number
  views: number
  tags: string[]
}

// Dữ liệu mẫu
const SAMPLE_USERS: User[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    username: "@nguyenvana",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Developer | Designer | Creator",
    followers: 1245,
    following: 235,
    location: "Hà Nội",
    occupation: "Software Engineer",
    email: "nguyenvana@gmail.com",
  },
  {
    id: 2,
    name: "Trần Thị B",
    username: "@tranthib",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "Marketing Specialist | Content Creator",
    followers: 856,
    following: 412,
    location: "TP. Hồ Chí Minh",
    occupation: "Marketing Manager",
    email: "tranthib@gmail.com",
  },
  {
    id: 3,
    name: "Lê Văn C",
    username: "@levanc",
    avatar: "https://i.pravatar.cc/150?img=8",
    bio: "Photographer | Traveler",
    followers: 2345,
    following: 178,
    location: "Đà Nẵng",
    occupation: "Photographer",
    email: "levanc@gmail.com",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    username: "@phamthid",
    avatar: "https://i.pravatar.cc/150?img=10",
    bio: "UI/UX Designer | Artist",
    followers: 1567,
    following: 324,
    location: "Hà Nội",
    occupation: "UI/UX Designer",
    email: "phamthid@gmail.com",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    username: "@hoangvane",
    avatar: "https://i.pravatar.cc/150?img=11",
    bio: "Software Engineer | Tech Enthusiast",
    followers: 987,
    following: 245,
    location: "TP. Hồ Chí Minh",
    occupation: "Senior Developer",
    email: "hoangvane@gmail.com",
  },
]

const SAMPLE_POSTS: Post[] = [
  {
    id: 1,
    title: "Hướng dẫn sử dụng React Hooks",
    content:
      "React Hooks là một tính năng mới được giới thiệu trong React 16.8. Hooks cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết class...",
    image: "https://source.unsplash.com/random/600x400?react",
    author: {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=1",
      email: "nguyenvana@gmail.com",
    },
    date: "2 giờ trước",
    likes: 45,
    comments: 12,
    views: 230,
    tags: ["React", "JavaScript", "Programming"],
  },
  {
    id: 2,
    title: "10 xu hướng thiết kế UI/UX năm 2023",
    content:
      "Năm 2023 chứng kiến nhiều xu hướng thiết kế UI/UX mới và thú vị. Từ thiết kế tối giản đến giao diện 3D, các nhà thiết kế đang không ngừng sáng tạo...",
    image: "https://source.unsplash.com/random/600x400?design",
    author: {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://i.pravatar.cc/150?img=5",
      email: "tranthib@gmail.com",
    },
    date: "5 giờ trước",
    likes: 78,
    comments: 23,
    views: 560,
    tags: ["Design", "UI/UX", "Trends"],
  },
  {
    id: 3,
    title: "Tối ưu hóa hiệu suất ứng dụng React",
    content:
      "Hiệu suất là một yếu tố quan trọng trong phát triển ứng dụng. Bài viết này sẽ chia sẻ các kỹ thuật tối ưu hóa hiệu suất cho ứng dụng React của bạn...",
    image: "https://source.unsplash.com/random/600x400?code",
    author: {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=1",
      email: "nguyenvana@gmail.com",
    },
    date: "1 ngày trước",
    likes: 32,
    comments: 8,
    views: 180,
    tags: ["React", "Performance", "Optimization"],
  },
]

// Danh sách các tab tìm kiếm
const SEARCH_FILTERS = [
  { id: "all", label: "Tất cả", icon: <FilterAlt /> },
  { id: "people", label: "Mọi người", icon: <Person /> },
  { id: "posts", label: "Bài viết", icon: <Article /> },
  { id: "groups", label: "Nhóm", icon: <Group /> },
  { id: "pages", label: "Trang", icon: <Public /> },
  { id: "photos", label: "Ảnh", icon: <Photo /> },
  { id: "events", label: "Sự kiện", icon: <Event /> },
  { id: "saved", label: "Đã lưu", icon: <Bookmark /> },
]

const SearchPage: React.FC = () => {
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState("all") // all, people, posts, etc.
  const [isLoading, setIsLoading] = useState(false)
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [friendIds, setFriendIds] = useState<number[]>([])
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
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.get("q") || ""

  // Thực hiện tìm kiếm khi query thay đổi
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    } else {
      setSearchPerformed(false)
      setFilteredUsers([])
      setFilteredPosts([])
    }
  }, [searchQuery])

  // Hàm thực hiện tìm kiếm
  const performSearch = (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    setSearchPerformed(true)

    // Giả lập API call
    setTimeout(() => {
      // Lọc người dùng
      const users = SAMPLE_USERS.filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          (user.bio && user.bio.toLowerCase().includes(query.toLowerCase())) ||
          (user.location && user.location.toLowerCase().includes(query.toLowerCase())) ||
          (user.occupation && user.occupation.toLowerCase().includes(query.toLowerCase())),
      )

      // Lọc bài viết
      const posts = SAMPLE_POSTS.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
          post.author.name.toLowerCase().includes(query.toLowerCase()),
      )

      setFilteredUsers(users)
      setFilteredPosts(posts)
      setIsLoading(false)
    }, 800)
  }

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
  }

  // Xử lý kết bạn
  const handleAddFriend = (userId: number) => {
    if (friendIds.includes(userId)) {
      // Nếu đã là bạn, hủy kết bạn
      setFriendIds(friendIds.filter((id) => id !== userId))
      setNotification({
        open: true,
        message: "Đã hủy kết bạn",
        type: "info",
      })
    } else {
      // Nếu chưa là bạn, thêm bạn
      setFriendIds([...friendIds, userId])
      setNotification({
        open: true,
        message: "Đã gửi lời mời kết bạn",
        type: "success",
      })
    }
  }

  // Xử lý lưu bài viết
  // const handleSavePost = (postId: number) => {
  //   // Giả lập lưu bài viết
  //   setNotification({
  //     open: true,
  //     message: "Đã lưu bài viết",
  //     type: "success",
  //   })
  // }

  // Xử lý đóng thông báo
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    })
  }

  // Hiển thị kết quả tìm kiếm dựa trên bộ lọc đang chọn
  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (!searchPerformed) {
      return (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Nhập từ khóa vào thanh tìm kiếm để bắt đầu
          </Typography>
        </Box>
      )
    }

    // Kiểm tra không có kết quả
    if (
      (activeFilter === "all" && filteredUsers.length === 0 && filteredPosts.length === 0) ||
      (activeFilter === "people" && filteredUsers.length === 0) ||
      (activeFilter === "posts" && filteredPosts.length === 0)
    ) {
      return (
        <Box sx={{ textAlign: "center", my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy kết quả nào cho "{searchQuery}"
          </Typography>
        </Box>
      )
    }

    // Hiển thị kết quả "Tất cả"
    if (activeFilter === "all") {
      return (
        <Box>
          {/* Người dùng */}
          {filteredUsers.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Người dùng</Typography>
              </Box>
              <UserList users={filteredUsers} isLoading={false} onAddFriend={handleAddFriend} friendIds={friendIds} />
            </Box>
          )}

          {/* Bài viết */}
          {filteredPosts.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Bài viết</Typography>
              </Box>
              <PostList
                posts={filteredPosts.map((post) => ({
                  id: post.id,
                  content: post.content,
                  images: post.image ? [{ id: post.id, url: post.image }] : [],
                  createdAt: post.date,
                  updatedAt: null,
                  user: {
                    id: post.author.id,
                    firstName: post.author.name.split(" ")[0],
                    lastName: post.author.name.split(" ").slice(1).join(" "),
                    avatar: post.author.avatar,
                    email: post.author.email,
                  },
                  likesCount: post.likes,
                  liked: false,
                  commentsCount: post.comments,
                  saved: false,
                  originalPost: undefined,
                  isDeleted: false,
                }))}
                isLoading={false}
              />
            </Box>
          )}
        </Box>
      )
    }

    // Hiển thị kết quả "Mọi người"
    if (activeFilter === "people") {
      return <UserList users={filteredUsers} isLoading={false} onAddFriend={handleAddFriend} friendIds={friendIds} />
    }

    // Hiển thị kết quả "Bài viết"
    if (activeFilter === "posts") {
      return (
        <PostList
          posts={filteredPosts.map((post) => ({
            id: post.id,
            content: post.content,
            images: post.image ? [{ id: post.id, url: post.image }] : [],
            createdAt: post.date,
            updatedAt: null,
            user: {
              id: post.author.id,
              firstName: post.author.name.split(" ")[0],
              lastName: post.author.name.split(" ").slice(1).join(" "),
              avatar: post.author.avatar,
              email: post.author.email,
            },
            likesCount: post.likes,
            liked: false,
            commentsCount: post.comments,
            saved: false,
            originalPost: undefined,
            isDeleted: false,
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
