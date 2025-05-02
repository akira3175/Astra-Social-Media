import type React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  CircularProgress,
} from "@mui/material";
import { Delete, Search, Visibility } from "@mui/icons-material";
import AdminLayout from "./components/AdminLayout";
import {
  getComments,
  deleteComment,
  FlattenedComment,
} from "../../services/adminService";

const CommentManagementPage: React.FC = () => {
  const [comments, setComments] = useState<FlattenedComment[]>([]);
  const [filteredComments, setFilteredComments] = useState<FlattenedComment[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedComment, setSelectedComment] =
    useState<FlattenedComment | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getComments({ page: 0, size: 100 }); // Fetch all comments for now
        setFilteredComments(response);
      } catch (err) {
        setError("Không thể tải danh sách bình luận. Vui lòng thử lại sau.");
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  // Filter comments when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredComments(comments);
    } else {
      const filtered = comments.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${comment.userComment.name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          comment.idComment.toString().includes(searchQuery.toLowerCase())
      );
      setFilteredComments(filtered);
    }
    setPage(0);
  }, [searchQuery, comments]);

  // Handle page change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle delete comment
  const handleDeleteComment = async () => {
    if (selectedComment) {
      try {
        await deleteComment(selectedComment.idComment);
        setComments(
          comments.filter(
            (comment) => comment.idComment !== selectedComment.idComment
          )
        );
        setFilteredComments(
          filteredComments.filter(
            (comment) => comment.idComment !== selectedComment.idComment
          )
        );
        setNotification({
          type: "success",
          message: "Đã xóa bình luận thành công",
        });
        setOpenDeleteDialog(false);
        setSelectedComment(null);
      } catch (err) {
        setNotification({
          type: "error",
          message: "Không thể xóa bình luận. Vui lòng thử lại sau.",
        });
        console.error("Error deleting comment:", err);
      }
    }
  };

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Format date
  const formatDate = (dateInput: string | number) => {
    // If the input is a number, assume it's a Unix timestamp in seconds
    const date =
      typeof dateInput === "number" ? new Date(dateInput) : new Date(dateInput);

    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </AdminLayout>
    );
  }

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
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="comment table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Bài viết</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  {/* <TableCell>Lượt thích</TableCell> */}
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((comment) => (
                    <TableRow key={comment.idComment}>
                      <TableCell>{comment.idComment}</TableCell>
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
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={comment.userComment.avatar || undefined}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {comment.userComment.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ID: {comment.postId}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(comment.createdAt)}</TableCell>
                      {/* <TableCell>{comment.likeCount}</TableCell> */}
                      <TableCell>
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedComment(comment);
                              setOpenViewDialog(true);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedComment(comment);
                              setOpenDeleteDialog(true);
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
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} của ${count}`
            }
          />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không
            thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteComment}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* View details dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết bình luận</DialogTitle>
        <DialogContent>
          {selectedComment && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={selectedComment.userComment.avatar || undefined}
                  sx={{ mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {selectedComment.userComment.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(selectedComment.createdAt)}
                  </Typography>
                </Box>
              </Box>

              <Paper
                variant="outlined"
                sx={{ p: 2, mb: 3, bgcolor: "background.default" }}
              >
                <Typography variant="body1">
                  {selectedComment.content}
                </Typography>
              </Paper>

              <Typography variant="subtitle2" gutterBottom>
                Thông tin bình luận
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>ID:</strong> {selectedComment.idComment}
                </Typography>
                <Typography variant="body2">
                  <strong>Bài viết ID:</strong> {selectedComment.idComment}
                </Typography>
                {/* <Typography variant="body2">
                  <strong>Lượt thích:</strong> {selectedComment.likeCount}
                </Typography>
              */}
                {selectedComment.parentId && (
                  <Typography variant="body2">
                    <strong>Bình luận cha:</strong> {selectedComment.parentId}
                  </Typography>
                )}
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
              setOpenViewDialog(false);
              setOpenDeleteDialog(true);
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default CommentManagementPage;
