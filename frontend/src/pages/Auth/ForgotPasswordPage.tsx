import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material"
import { LockReset, ArrowForward, ArrowBack } from "@mui/icons-material"
import { sendForgotPasswordEmail } from "../../services/authService"

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email")
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Địa chỉ email không hợp lệ")
      return
    }

    setIsLoading(true)

    try {
      // Call API to send password reset email
      await sendForgotPasswordEmail(email)
      setSuccess("Đường dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến.")
      setEmail("")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.")
      }
      console.error("Send reset email error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 550, width: "100%", mx: "auto", boxShadow: 3 }}>
        <CardHeader
          title={
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" component="div" gutterBottom>
                Quên mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhập email của bạn để nhận đường dẫn đặt lại mật khẩu
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <LockReset sx={{ fontSize: 80, color: "primary.main" }} />
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Địa chỉ email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || !!success}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading || !!success}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                bgcolor: "#4f46e5",
                "&:hover": { bgcolor: "#4338ca" },
              }}
              endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
            >
              {isLoading ? "Đang xử lý..." : "Gửi đường dẫn đặt lại mật khẩu"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button component={Link} to="/login" startIcon={<ArrowBack />} sx={{ textTransform: "none" }}>
                Quay lại trang đăng nhập
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ForgotPasswordPage
