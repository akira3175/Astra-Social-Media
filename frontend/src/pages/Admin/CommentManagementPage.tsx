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
  DialogContentText,
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
} from "@mui/material"
import { Delete, Search, Visibility, FilterList, Flag } from "@mui/icons-material"
import AdminLayout from "./components/AdminLayout"

// Định nghĩa kiểu dữ liệu
interface Comment {
  id: number
  content: string
  author: {
    id: number
    name: string
    avatar: string
  }
  post: {
    id: number
    title: string
  }
  status: "approved" | "pending" | "spam" | "rejected"
  createdAt: string
  likes: number
  reports: number
}

// Dữ liệu mẫu
const SAMPLE_COMMENTS: Comment[] = [
  {
    id: 1,
    content: "Bài viết rất hữu ích, cảm ơn bạn!",
    author: {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?img=8",
    },
    post: {
      id: 1,
      title: "Hướng dẫn sử dụng React Hooks",
    },
    status: "approved",
    createdAt: "2023-05-15 11:30",
    likes: 5,
    reports: 0,
  },
  {
    id: 2,
    content: "Tôi đã áp dụng và thấy hiệu quả ngay",
    author: {
      id: 4,
      name: "Phạm Thị D",
      avatar: "https://i.pravatar.cc/150?img=10",
    },
    post: {
      id: 2,
      title: "10 xu hướng thiết kế UI/UX năm 2023",
    },
    status: "approved",
    createdAt: "2023-05-14 15:45",
    likes: 8,
    reports: 0,
  },
  {
    id: 3,
    content: "Bạn có thể giải thích rõ hơn về phần useEffect không?",
    author: {
      id: 5,
      name: "Hoàng Văn E",
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    post: {
      id: 1,
      title: "Hướng dẫn sử dụng React Hooks",
    },
    status: "pending",
    createdAt: "2023-05-16 09:20",
    likes: 0,
    reports: 0,
  },
  {
    id: 4,
    content: "Mua ngay sản phẩm giảm giá tại link: https://spam-link.com",
    author: {
      id: 6,
      name: "Spam User",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    post: {
      id: 3,
      title: "Tối ưu hóa hiệu suất ứng dụng React",
    },
    status: "spam",
    createdAt: "2023-05-16 10:15",
    likes: 0,
    reports: 3,
  },
  {
    id: 5,
    content: "Nội dung này không phù hợp với chủ đề bài viết",
    author: {
      id: 7,
      name: "Trương Văn F",
      avatar: "https://i.pravatar.cc/150?img=13",
    },
    post: {
      id: 4,
      title: "Cách xây dựng API với Node.js và Express",
    },
    status: "rejected",
    createdAt: "2023-05-15 16:30",
    likes: 1,
    reports: 2,
  },
]

const CommentManagementPage: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredComments, setFilteredComments] = useState<Comment[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Tải dữ liệu bình luận
  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      setComments(SAMPLE_COMMENTS)
      setFilteredComments(SAMPLE_COMMENTS)
    }, 500)
  }, [])

  // Lọc bình luận khi tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredComments(comments)
    } else {
      const filtered = comments.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.post.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredComments(filtered)
    }
    setPage(0)
  }, [searchQuery, comments])

  // Xử lý thay đổi trang
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Xử lý xóa bình luận
  const handleDeleteComment = () => {
    if (selectedComment) {
      // Giả lập API call
      setTimeout(() => {
        setComments(comments.filter((comment) => comment.id !== selectedComment.id))
        setFilteredComments(filteredComments.filter((comment) => comment.id !== selectedComment.id))
        setNotification({
          type: "success",
          message: "Đã xóa bình luận thành công",
        })
        setOpenDeleteDialog(false)
        setSelectedComment(null)
      }, 500)
    }
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

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý bình luận
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý và kiểm duyệt bình luận trong hệ thống
        </Typography>
      </Box>

      {notification && (
        <Alert severity={notification.type} sx={{ mb: 3 }}>
          {notification.message}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <TextField
              placeholder="Tìm kiếm bình luận..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: "50%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
            <Button variant="outlined" startIcon={<FilterList />}>
              Lọc
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="comment table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Bài viết</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>{comment.id}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {comment.content}
                      </Typography>
                      {comment.reports > 0 && (
                        <Chip
                          icon={<Flag fontSize="small" />}
                          label={`${comment.reports} báo cáo`}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={comment.author.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                        <Typography variant="body2">{comment.author.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {comment.post.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          comment.status === "approved"
                            ? "Đã duyệt"
                            : comment.status === "pending"
                              ? "Chờ duyệt"
                              : comment.status === "spam"
                                ? "Spam"
                                : "Từ chối"
                        }
                        color={
                          comment.status === "approved"
                            ? "success"
                            : comment.status === "pending"
                              ? "warning"
                              : comment.status === "spam"
                                ? "error"
                                : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{comment.createdAt}</TableCell>
                    <TableCell>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedComment(comment)
                            setOpenViewDialog(true)
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedComment(comment)
                            setOpenDeleteDialog(true)
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredComments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không tìm thấy bình luận nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredComments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteComment} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem chi tiết */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết bình luận</DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar src={selectedComment.author.avatar} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1">{selectedComment.author.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedComment.createdAt}
                  </Typography>
                </Box>
              </Box>

              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
                <Typography variant="body1">{selectedComment.content}</Typography>
              </Paper>

              <Typography variant="subtitle2" gutterBottom>
                Thông tin bình luận
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                <Typography variant="body2">
                  <strong>ID:</strong> {selectedComment.id}
                </Typography>
                <Typography variant="body2">
                  <strong>Bài viết:</strong> {selectedComment.post.title}
                </Typography>
                <Typography variant="body2">
                  <strong>Trạng thái:</strong>{" "}
                  <Chip
                    label={
                      selectedComment.status === "approved"
                        ? "Đã duyệt"
                        : selectedComment.status === "pending"
                          ? "Chờ duyệt"
                          : selectedComment.status === "spam"
                            ? "Spam"
                            : "Từ chối"
                    }
                    color={
                      selectedComment.status === "approved"
                        ? "success"
                        : selectedComment.status === "pending"
                          ? "warning"
                          : selectedComment.status === "spam"
                            ? "error"
                            : "default"
                    }
                    size="small"
                  />
                </Typography>
                <Typography variant="body2">
                  <strong>Lượt thích:</strong> {selectedComment.likes}
                </Typography>
                <Typography variant="body2">
                  <strong>Báo cáo:</strong> {selectedComment.reports}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => {
              setOpenViewDialog(false)
              setOpenDeleteDialog(true)
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  )
}

export default CommentManagementPage
