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
  CircularProgress,
} from "@mui/material"
import { Visibility, Block, CheckCircle, FilterList, Search } from "@mui/icons-material"
import AdminLayout from "./components/AdminLayout"
import { getUsers, banUser, unbanUser, User } from "../../services/adminService"

// Định nghĩa kiểu dữ liệu cho UI
interface UserUI {
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

// Transform backend user data to UI format
const transformUserToUI = (user: User): UserUI => {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    username: user.email.split('@')[0], // Using email prefix as username
    email: user.email,
    avatar: user.avatar || `https://i.pravatar.cc/150?img=${user.id}`, // Fallback avatar
    status: user.isActive ? "active" : "banned",
    role: user.isSuperUser ? "admin" : "user",
    registeredDate: new Date(user.dateJoined).toLocaleDateString(),
    lastActive: new Date(user.lastLogin).toLocaleString(),
  }
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserUI[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserUI[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selectedUser, setSelectedUser] = useState<UserUI | null>(null)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tải dữ liệu người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getUsers()
        const transformedUsers = response.map(transformUserToUI)
        setUsers(transformedUsers)
        setFilteredUsers(transformedUsers)
      } catch (err) {
        setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.")
        console.error("Error fetching users:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
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
  const handleToggleUserStatus = async (user: UserUI) => {
    try {
      if (user.status === "active") {
        await banUser(user.id)
      } else {
        await unbanUser(user.id)
      }

      // Update local state
      const updatedUsers = users.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === "active" ? "banned" : "active" }
          : u
      )
      setUsers(updatedUsers as UserUI[])
      setFilteredUsers(updatedUsers as UserUI[])

      setNotification({
        type: "success",
        message: `Đã ${user.status === "active" ? "khóa" : "mở khóa"} tài khoản ${user.name} thành công`,
      })
    } catch (err) {
      setNotification({
        type: "error",
        message: `Không thể ${user.status === "active" ? "khóa" : "mở khóa"} tài khoản. Vui lòng thử lại sau.`,
      })
      console.error("Error toggling user status:", err)
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

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </AdminLayout>
    )
  }

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
                        label={user.status === "active" ? "Hoạt động" : "Bị cấm"}
                        color={user.status === "active" ? "success" : "error"}
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
                  label={selectedUser.status === "active" ? "Hoạt động" : "Bị cấm"}
                  color={selectedUser.status === "active" ? "success" : "error"}
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
