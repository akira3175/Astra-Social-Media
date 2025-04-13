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
} from "@mui/material"
import { Visibility, Block, CheckCircle, FilterList, Search } from "@mui/icons-material"
import AdminLayout from "./components/AdminLayout"

// Định nghĩa kiểu dữ liệu
interface User {
  id: number
  name: string
  username: string
  email: string
  avatar: string
  status: "active" | "inactive" | "banned"
  role: "user" | "moderator" | "admin"
  registeredDate: string
  lastActive: string
}

// Dữ liệu mẫu
const SAMPLE_USERS: User[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    username: "nguyenvana",
    email: "nguyenvana@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    status: "active",
    role: "admin",
    registeredDate: "2023-01-15",
    lastActive: "2023-05-20 14:30",
  },
  {
    id: 2,
    name: "Trần Thị B",
    username: "tranthib",
    email: "tranthib@example.com",
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "active",
    role: "user",
    registeredDate: "2023-02-10",
    lastActive: "2023-05-19 09:15",
  },
  {
    id: 3,
    name: "Lê Văn C",
    username: "levanc",
    email: "levanc@example.com",
    avatar: "https://i.pravatar.cc/150?img=8",
    status: "inactive",
    role: "user",
    registeredDate: "2023-03-05",
    lastActive: "2023-04-30 16:45",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    username: "phamthid",
    email: "phamthid@example.com",
    avatar: "https://i.pravatar.cc/150?img=10",
    status: "banned",
    role: "user",
    registeredDate: "2023-03-20",
    lastActive: "2023-04-15 11:20",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    username: "hoangvane",
    email: "hoangvane@example.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    status: "active",
    role: "user",
    registeredDate: "2023-04-01",
    lastActive: "2023-05-18 13:10",
  },
]

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Tải dữ liệu người dùng
  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      setUsers(SAMPLE_USERS)
      setFilteredUsers(SAMPLE_USERS)
    }, 500)
  }, [])

  // Lọc người dùng khi tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
    setPage(0)
  }, [searchQuery, users])

  // Xử lý thay đổi trang
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Xử lý thay đổi số hàng mỗi trang
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Xử lý khóa/mở khóa người dùng
  const handleToggleUserStatus = (user: User) => {
    const newStatus = user.status === "active" ? "banned" : "active"
    // const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))

    // setUsers(updatedUsers)
    // setFilteredUsers(updatedUsers)

    setNotification({
      type: "success",
      message: `Đã ${newStatus === "active" ? "mở khóa" : "khóa"} tài khoản ${user.name} thành công`,
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

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Quản lý người dùng
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý thông tin và quyền của người dùng trong hệ thống
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
              placeholder="Tìm kiếm người dùng..."
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
            <Box>
              <Button variant="outlined" startIcon={<FilterList />} sx={{ mr: 1 }}>
                Lọc
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="user table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày đăng ký</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={user.avatar} sx={{ mr: 2 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                        color={user.role === "admin" ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          user.status === "active"
                            ? "Hoạt động"
                            : user.status === "inactive"
                              ? "Không hoạt động"
                              : "Bị cấm"
                        }
                        color={user.status === "active" ? "success" : user.status === "inactive" ? "warning" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{user.registeredDate}</TableCell>
                    <TableCell>
                      <Tooltip title="Xem chi tiết">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedUser(user)
                            setOpenViewDialog(true)
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user.status === "active" ? (
                        <Tooltip title="Khóa tài khoản">
                          <IconButton size="small" onClick={() => handleToggleUserStatus(user)}>
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Kích hoạt tài khoản">
                          <IconButton size="small" onClick={() => handleToggleUserStatus(user)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Không tìm thấy người dùng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredUsers.length}
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
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thông tin người dùng</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar src={selectedUser.avatar} sx={{ width: 80, height: 80, mr: 3 }} />
                <Box>
                  <Typography variant="h6">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{selectedUser.username}
                  </Typography>
                  <Chip
                    label={selectedUser.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    color={selectedUser.role === "admin" ? "primary" : "default"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Thông tin liên hệ
              </Typography>
              <Typography variant="body2" paragraph>
                Email: {selectedUser.email}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                Thông tin tài khoản
              </Typography>
              <Typography variant="body2">
                Trạng thái:{" "}
                <Chip
                  label={
                    selectedUser.status === "active"
                      ? "Hoạt động"
                      : selectedUser.status === "inactive"
                        ? "Không hoạt động"
                        : "Bị cấm"
                  }
                  color={
                    selectedUser.status === "active"
                      ? "success"
                      : selectedUser.status === "inactive"
                        ? "warning"
                        : "error"
                  }
                  size="small"
                />
              </Typography>
              <Typography variant="body2">Ngày đăng ký: {selectedUser.registeredDate}</Typography>
              <Typography variant="body2">Hoạt động gần nhất: {selectedUser.lastActive}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Đóng</Button>
          {selectedUser && (
            <Button
              variant="contained"
              color={selectedUser.status === "active" ? "error" : "success"}
              onClick={() => {
                handleToggleUserStatus(selectedUser)
                setOpenViewDialog(false)
              }}
            >
              {selectedUser.status === "active" ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </AdminLayout>
  )
}

export default UserManagementPage
