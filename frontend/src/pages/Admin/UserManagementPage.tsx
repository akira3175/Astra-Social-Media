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
  CircularProgress,
} from "@mui/material"
import {
  Search,
  Visibility,
  Block,
  CheckCircle,
  Person,
  CalendarToday,
  Email,
} from "@mui/icons-material"
import AdminLayout from "./components/AdminLayout"
import { User, getUsers, banUser, unbanUser } from "../../services/adminService"

// Interface for UI representation of user
interface UserUI extends User {
  status: "active" | "banned";
  registeredDate: string;
  lastActive: string;
}

// Transform backend user data to UI format
const transformUserToUI = (user: User): UserUI => {
  return {
    ...user,
    status: user.isActive ? "active" : "banned",
    registeredDate: user.dateJoined,
    lastActive: user.lastLogin || user.dateJoined,
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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUsers({ page: 0, size: 100 }) // Fetch all users for now
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

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Filter users when search query or status filter changes
  useEffect(() => {
    let filtered = users

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)||
          user.id.toString().includes(query)
      )
    }



    setFilteredUsers(filtered)
    setPage(0)
  }, [searchQuery, users, statusFilter])

  // Handle page change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle user status toggle (ban/unban)
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
      ) as UserUI[]
      setUsers(updatedUsers)
      setFilteredUsers(updatedUsers)

      setNotification({
        type: "success",
        message: `Đã ${user.status === "active" ? "khóa" : "mở khóa"} người dùng thành công`,
      })
    } catch (err) {
      setNotification({
        type: "error",
        message: `Không thể ${user.status === "active" ? "khóa" : "mở khóa"} người dùng. Vui lòng thử lại sau.`,
      })
      console.error("Error toggling user status:", err)
    }
  }

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Handle status filter change
  const handleStatusFilterChange = (status: "all" | "active" | "banned") => {
    setStatusFilter(status)
  }

  // Format date
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
          Quản lý tất cả người dùng trong hệ thống
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
              placeholder="Tìm kiếm người dùng..."
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
                Đang hoạt động
              </Button>
              <Button
                variant={statusFilter === "banned" ? "contained" : "outlined"}
                onClick={() => handleStatusFilterChange("banned")}
                size="small"
                color="error"
              >
                Đã khóa
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
                  <TableCell>Ngày đăng ký</TableCell>
                  <TableCell>Lần đăng nhập cuối</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar src={user.avatar || undefined} sx={{ width: 32, height: 32, mr: 1 }} />
                        <Typography variant="body2">{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDate(user.registeredDate)}</TableCell>
                    <TableCell>{formatDate(user.lastActive)}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                        color={user.status === "active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
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
                        <Tooltip title="Khóa người dùng">
                          <IconButton size="small" onClick={() => handleToggleUserStatus(user)}>
                            <Block fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Mở khóa người dùng">
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

      {/* User details dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết người dùng</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              {/* User info */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Avatar
                      src={selectedUser.avatar || undefined}
                      sx={{ width: 120, height: 120, mb: 2 }}
                    />
                    <Typography variant="h6">{selectedUser.name}</Typography>
                    <Chip
                      label={selectedUser.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                      color={selectedUser.status === "active" ? "success" : "error"}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Person sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1">
                        <strong>Tên:</strong> {selectedUser.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Email sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1">
                        <strong>Email:</strong> {selectedUser.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1">
                        <strong>Ngày đăng ký:</strong> {formatDate(selectedUser.registeredDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                      <Typography variant="body1">
                        <strong>Lần đăng nhập cuối:</strong> {formatDate(selectedUser.lastActive)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Additional info */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Thông tin tài khoản
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          ID:
                        </Typography>
                        <Typography variant="body2">{selectedUser.id}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Vai trò:
                        </Typography>
                        <Typography variant="body2">
                          {selectedUser.isSuperUser ? "Admin" : selectedUser.isStaff ? "Staff" : "User"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Trạng thái:
                        </Typography>
                        <Chip
                          label={selectedUser.status === "active" ? "Đang hoạt động" : "Đã khóa"}
                          color={selectedUser.status === "active" ? "success" : "error"}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Thông tin cá nhân
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Họ:
                        </Typography>
                        <Typography variant="body2">{selectedUser.lastName}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" color="text.secondary">
                          Tên:
                        </Typography>
                        <Typography variant="body2">{selectedUser.firstName}</Typography>
                      </Box>
                      {selectedUser.bio && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="body2" color="text.secondary">
                            Giới thiệu:
                          </Typography>
                          <Typography variant="body2">{selectedUser.bio}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
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
              {selectedUser.status === "active" ? "Khóa người dùng" : "Mở khóa người dùng"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </AdminLayout>
  )
}

export default UserManagementPage
