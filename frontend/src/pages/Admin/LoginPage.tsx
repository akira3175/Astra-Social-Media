import type React from "react"
import { useState } from "react"
import {
  Box,
  Button,
  CardContent,
  Container,
  Divider,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Paper,
} from "@mui/material"
import { Visibility, VisibilityOff, Login as LoginIcon, AdminPanelSettings } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { adminLogin } from "../../services/adminService"

const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin đăng nhập")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await adminLogin({ email: username, password })
      navigate("/admin/dashboard")
    } catch {
      setError("Tên đăng nhập hoặc mật khẩu không đúng")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fb",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 32, mr: 2 }} />
            <Typography variant="h5" component="h1">
              Quản trị hệ thống
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Đăng nhập
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vui lòng đăng nhập để tiếp tục
            </Typography>

            <Box component="form" onSubmit={handleLogin}>
              <TextField
                label="Tên đăng nhập"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
                required
                autoFocus
              />

              <TextField
                label="Mật khẩu"
                variant="outlined"
                fullWidth
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={<LoginIcon />}
                sx={{ mt: 3, mb: 2 }}
              >
                {isLoading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                THÔNG TIN
              </Typography>
            </Divider>

            <Typography variant="body2" color="text.secondary" align="center">
              Đây là trang đăng nhập dành cho quản trị viên.
              <br />
              Nếu bạn không phải là quản trị viên, vui lòng quay lại trang chủ.

            </Typography>

            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Button variant="text" onClick={() => navigate("/")}>
                Quay lại trang chủ
              </Button>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminLoginPage
