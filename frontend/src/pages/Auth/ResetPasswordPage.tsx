import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
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
  InputAdornment,
  IconButton,
} from "@mui/material"
import { LockOutlined, ArrowForward, ArrowBack, Visibility, VisibilityOff, CheckCircle } from "@mui/icons-material"
import { verifyResetToken, resetPassword } from "../../services/authService"

const ResetPasswordPage: React.FC = () => {
  const [token, setToken] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isVerifying, setIsVerifying] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [tokenValid, setTokenValid] = useState<boolean>(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Extract token from URL
    const queryParams = new URLSearchParams(location.search)
    const tokenFromUrl = queryParams.get("token")

    if (!tokenFromUrl) {
      setError("Token không hợp lệ hoặc đã hết hạn")
      setIsVerifying(false)
      return
    }

    setToken(tokenFromUrl)

    // Verify token
    const verifyToken = async () => {
      try {
        await verifyResetToken(tokenFromUrl)
        setTokenValid(true)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Token không hợp lệ hoặc đã hết hạn")
        }
        console.error("Token verification error:", err)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [location.search])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp")
      return
    }

    // Password strength validation
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }

    setIsLoading(true)

    try {
      // Call API to reset password
      await resetPassword(token, newPassword)
      setSuccess(true)

      // Clear form
      setNewPassword("")
      setConfirmPassword("")

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Không thể đặt lại mật khẩu. Vui lòng thử lại.")
      }
      console.error("Reset password error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  if (isVerifying) {
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
        <Card sx={{ maxWidth: 550, width: "100%", mx: "auto", boxShadow: 3, p: 4, textAlign: "center" }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Đang xác thực token...
          </Typography>
        </Card>
      </Box>
    )
  }

  if (success) {
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
        <Card sx={{ maxWidth: 550, width: "100%", mx: "auto", boxShadow: 3, p: 4, textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Đặt lại mật khẩu thành công!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây.
          </Typography>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "#4f46e5",
              "&:hover": { bgcolor: "#4338ca" },
            }}
          >
            Đăng nhập ngay
          </Button>
        </Card>
      </Box>
    )
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
                Đặt lại mật khẩu
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nhập mật khẩu mới của bạn
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <LockOutlined sx={{ fontSize: 80, color: "primary.main" }} />
          </Box>

          {!tokenValid ? (
            <Box sx={{ textAlign: "center" }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error || "Token không hợp lệ hoặc đã hết hạn"}
              </Alert>
              <Button
                component={Link}
                to="/forgot-password"
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: "#4f46e5",
                  "&:hover": { bgcolor: "#4338ca" },
                }}
              >
                Yêu cầu đường dẫn mới
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                margin="normal"
                required
                fullWidth
                name="newPassword"
                label="Mật khẩu mới"
                type={showPassword ? "text" : "password"}
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={toggleShowPassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Mật khẩu phải có ít nhất 8 ký tự.
              </Typography>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  bgcolor: "#4f46e5",
                  "&:hover": { bgcolor: "#4338ca" },
                }}
                endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ArrowForward />}
              >
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button component={Link} to="/login" startIcon={<ArrowBack />} sx={{ textTransform: "none" }}>
                  Quay lại trang đăng nhập
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ResetPasswordPage
