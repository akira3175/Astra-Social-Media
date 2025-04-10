"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Tooltip,
  Alert,
  InputAdornment,
  Grid,
  Divider,
} from "@mui/material"
import {
  Search,
  Visibility,
  Block,
  CheckCircle,
  ThumbUp,
  Comment,
  CalendarToday,
  Person,
  Image as ImageIcon,
} from "@mui/icons-material"
import AdminLayout from "./components/AdminLayout"
import type { Post } from "../../types/post"

// Dữ liệu mẫu
const SAMPLE_POSTS: Post[] = [
  {
    id: 1,
    content:
      "React Hooks là một tính năng mới được giới thiệu trong React 16.8. Hooks cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết class...",
    images: [{ id: 101, url: "https://source.unsplash.com/random/600x400?react" }],
    createdAt: "2023-05-15 10:30",
    updatedAt: null,
    user: {
      id: 1,
      firstName: "Văn",
      lastName: "Nguyễn",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    likesCount: 45,
    liked: false,
    commentsCount: 12,
    saved: false,
    isDeleted: false,
  },
  {
    id: 2,
    content:
      "Năm 2023 chứng kiến nhiều xu hướng thiết kế UI/UX mới và thú vị. Từ thiết kế tối giản đến giao diện 3D, các nhà thiết kế đang không ngừng sáng tạo...",
    images: [{ id: 102, url: "https://source.unsplash.com/random/600x400?design" }],
    createdAt: "2023-05-10 14:15",
    updatedAt: "2023-05-11 09:20",
    user: {
      id: 2,
      firstName: "Thị",
      lastName: "Trần",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    likesCount: 78,
    liked: false,
    commentsCount: 23,
    saved: false,
    isDeleted: false,
  },
  {
    id: 3,
    content:
      "Hiệu suất là một yếu tố quan trọng trong phát triển ứng dụng. Bài viết này sẽ chia sẻ các kỹ thuật tối ưu hóa hiệu suất cho ứng dụng React của bạn...",
    images: [{ id: 103, url: "https://source.unsplash.com/random/600x400?code" }],
    createdAt: "2023-04-25 16:45",
    updatedAt: null,
    user: {
      id: 1,
      firstName: "Văn",
      lastName: "Nguyễn",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    likesCount: 32,
    liked: false,
    commentsCount: 8,
    saved: false,
    isDeleted: false,
  },
  {
    id: 4,
    content:
      "Node.js và Express là công cụ tuyệt vời để xây dựng API. Trong bài viết này, tôi sẽ hướng dẫn cách tạo một RESTful API đơn giản...",
    images: [{ id: 104, url: "https://source.unsplash.com/random/600x400?server" }],
    createdAt: "2023-04-05 09:20",
    updatedAt: null,
    user: {
      id: 3,
      firstName: "Văn",
      lastName: "Lê",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    likesCount: 65,
    liked: false,
    commentsCount: 15,
    saved: false,
    isDeleted: true,
  },
  {
    id: 5,
    content:
      "TypeScript là một superset của JavaScript cung cấp tính năng kiểu dữ liệu tĩnh. Bài viết này sẽ giới thiệu các khái niệm cơ bản cho người mới bắt đầu...",
    images: [{ id: 105, url: "https://source.unsplash.com/random/600x400?typescript" }],
    createdAt: "2023-05-18 16:45",
    updatedAt: "2023-05-19 10:30",
    user: {
      id: 2,
      firstName: "Thị",
      lastName: "Trần",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    likesCount: 56,
    liked: false,
    commentsCount: 15,
    saved: false,
    isDeleted: false,
  },
  {
    id: 6,
    content: "Đây là một bài đăng lại từ bài viết gốc về React Hooks",
    images: [],
    createdAt: "2023-05-20 11:30",
    updatedAt: null,
    user: {
      id: 4,
      firstName: "Thị",
      lastName: "Phạm",
      avatar: "https://i.pravatar.cc/150?img=10",
    },
    likesCount: 12,
    liked: false,
    commentsCount: 3,
    saved: false,
    originalPost: {
      id: 1,
      content:
        "React Hooks là một tính năng mới được giới thiệu trong React 16.8. Hooks cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết class...",
      images: [{ id: 101, url: "https://source.unsplash.com/random/600x400?react" }],
      createdAt: "2023-05-15 10:30",
      updatedAt: null,
      user: {
        id: 1,
        firstName: "Văn",
        lastName: "Nguyễn",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      likesCount: 45,
      liked: false,
      commentsCount: 12,
      saved: false,
      isDeleted: false,
    },
    isDeleted: false,
  },
]

const PostManagementPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deleted">("all")

  // Tải dữ liệu bài viết
  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      setPosts(SAMPLE_POSTS)
      setFilteredPosts(SAMPLE_POSTS)
    }, 500)
  }, [])

  // Lọc bài viết khi tìm kiếm hoặc thay đổi bộ lọc
  useEffect(() => {
    let filtered = posts

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      filtered = filtered.filter((post) => (statusFilter === "deleted" ? post.isDeleted : !post.isDeleted))
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.content.toLowerCase().includes(query) ||
          `${post.user.lastName} ${post.user.firstName}`.toLowerCase().includes(query),
      )
    }

    setFilteredPosts(filtered)
    setPage(0)
  }, [searchQuery, posts, statusFilter])

  // Xử lý thay đổi trang
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Xử lý khóa/mở khóa bài viết
  const handleTogglePostStatus = (post: Post) => {
    const updatedPosts = posts.map((p) => (p.id === post.id ? { ...p, isDeleted: !p.isDeleted } : p))

    setPosts(updatedPosts)
    setFilteredPosts(updatedPosts)

    setNotification({
      type: "success",
      message: `Đã ${post.isDeleted ? "khôi phục" : "khóa"} bài viết thành công`,
    })
  }

  // Hiển thị thông báo
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Xử lý thay đổi bộ lọc trạng thái
  const handleStatusFilterChange = (status: "all" | "active" | "deleted") => {
    setStatusFilter(status)
  }

  // Format thời gian
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Rút gọn nội dung
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý bài viết
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý tất cả bài viết trong hệ thống
        </Typography>
      </Box>

      {notification && (
        <Alert severity={notification.type} sx={{ mb: 3 }}>
          {notification.message}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
            <TextField
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: "100%", sm: "50%" } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant={statusFilter === "all" ? "contained" : "outlined"}
                onClick={() => handleStatusFilterChange("all")}
                size="small"
              >
                Tất cả
              </Button>
              <Button
                variant={statusFilter === "active" ? "contained" : "outlined"}
                onClick={() => handleStatusFilterChange("active")}
                size="small"
                color="success"
              >
                Đang hiển thị
              </Button>
              <Button
                variant={statusFilter === "deleted" ? "contained" : "outlined"}
                onClick={() => handleStatusFilterChange("deleted")}
                size="small"
                color="error"
              >
                Đã khóa
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="post table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Người đăng</TableCell>
                  <TableCell>Ngày đăng</TableCell>
                  <TableCell>Tương tác</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPosts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>{post.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {post.images && post.images.length > 0 && (
                          <Box
                            component="img"
                            src={post.images[0].url}
                            alt="Post thumbnail"
                            sx={{
                              width: 60,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 1,
                              mr: 2,
                            }}
                          />
                        )}
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {truncateContent(post.content, 50)}
                          </Typography>
                          {post.originalPost && (
                            <Chip label="Bài đăng lại" size="small" color="info" variant="outlined" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={post.user.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                        <Typography variant="body2">
                          {post.user.lastName} {post.user.firstName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(post.createdAt)}</Typography>
                      {post.updatedAt && (
                        <Typography variant="caption" color="text.secondary">
                          Cập nhật: {formatDate(post.updatedAt)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Tooltip title="Lượt thích">
                          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                            <ThumbUp fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "text.secondary" }} />
                            <Typography variant="body2">{post.likesCount}</Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Bình luận">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Comment fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem", color: "text.secondary" }} />
                            <Typography variant="body2">{post.commentsCount}</Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={post.isDeleted ? "Đã khóa" : "Đang hiển thị"}
                        color={post.isDeleted ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedPost(post)
                            setOpenViewDialog(true)
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!post.isDeleted ? (
                        <Tooltip title="Khóa bài viết">
                          <IconButton size="small" onClick={() => handleTogglePostStatus(post)}>
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Khôi phục bài viết">
                          <IconButton size="small" onClick={() => handleTogglePostStatus(post)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPosts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không tìm thấy bài viết nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPosts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog xem chi tiết */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết bài viết</DialogTitle>
        <DialogContent dividers>
          {selectedPost && (
            <Box sx={{ pt: 1 }}>
              {/* Thông tin người đăng */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar src={selectedPost.user.avatar} sx={{ width: 48, height: 48, mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {selectedPost.user.lastName} {selectedPost.user.firstName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                    <CalendarToday fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem" }} />
                    {formatDate(selectedPost.createdAt)}
                    {selectedPost.updatedAt && ` (Cập nhật: ${formatDate(selectedPost.updatedAt)})`}
                  </Typography>
                </Box>
              </Box>

              {/* Nội dung bài viết */}
              <Typography variant="body1" paragraph sx={{ whiteSpace: "pre-wrap" }}>
                {selectedPost.content}
              </Typography>

              {/* Hình ảnh */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <Box sx={{ my: 2 }}>
                  <Grid container spacing={1}>
                    {selectedPost.images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={image.id}>
                        <Box
                          component="img"
                          src={image.url}
                          alt={`Post image ${index + 1}`}
                          sx={{
                            width: "100%",
                            borderRadius: 1,
                            maxHeight: 300,
                            objectFit: "cover",
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Bài viết gốc (nếu là bài đăng lại) */}
              {selectedPost.originalPost && (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Bài viết gốc:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Avatar src={selectedPost.originalPost.user.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">
                          {selectedPost.originalPost.user.lastName} {selectedPost.originalPost.user.firstName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(selectedPost.originalPost.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {selectedPost.originalPost.content}
                    </Typography>
                    {selectedPost.originalPost.images && selectedPost.originalPost.images.length > 0 && (
                      <Box
                        component="img"
                        src={selectedPost.originalPost.images[0].url}
                        alt="Original post image"
                        sx={{
                          width: "100%",
                          maxHeight: 200,
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />
                    )}
                  </Paper>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Thông tin tương tác */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Thông tin tương tác
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                      <Box>
                        <ThumbUp color="primary" />
                        <Typography variant="h6">{selectedPost.likesCount}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lượt thích
                        </Typography>
                      </Box>
                      <Box>
                        <Comment color="primary" />
                        <Typography variant="h6">{selectedPost.commentsCount}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Bình luận
                        </Typography>
                      </Box>
                      {selectedPost.images && selectedPost.images.length > 0 && (
                        <Box>
                          <ImageIcon color="primary" />
                          <Typography variant="h6">{selectedPost.images.length}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Hình ảnh
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Thông tin bài viết
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          ID:
                        </Typography>
                        <Typography variant="body2">{selectedPost.id}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Người đăng:
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Person fontSize="small" sx={{ mr: 0.5, fontSize: "0.9rem" }} />
                          <Typography variant="body2">
                            {selectedPost.user.lastName} {selectedPost.user.firstName}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái:
                        </Typography>
                        <Chip
                          label={selectedPost.isDeleted ? "Đã khóa" : "Đang hiển thị"}
                          color={selectedPost.isDeleted ? "error" : "success"}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
          {selectedPost && (
            <Button
              variant="contained"
              color={selectedPost.isDeleted ? "success" : "error"}
              onClick={() => {
                handleTogglePostStatus(selectedPost)
                setOpenViewDialog(false)
              }}
            >
              {selectedPost.isDeleted ? "Khôi phục bài viết" : "Khóa bài viết"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </AdminLayout>
  )
}

export default PostManagementPage
