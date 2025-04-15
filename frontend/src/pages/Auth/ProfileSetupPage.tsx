import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Alert,
  Avatar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material"
import { PersonOutline, ArrowForward } from "@mui/icons-material"
import { register, login, getCurrentUser } from "../../services/authService"
import { useCurrentUser } from "../../contexts/currentUserContext"

const ProfileSetupPage: React.FC = () => {
  const { setCurrentUser } = useCurrentUser()
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationData, setRegistrationData] = useState<{ email: string; password: string } | null>(null)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()

  useEffect(() => {
    // Retrieve registration data from session storage
    const storedData = sessionStorage.getItem("registrationData")
    if (!storedData) {
      // If no registration data, redirect back to register page
      navigate("/register")
      return
    }

    try {
      const parsedData = JSON.parse(storedData)
      setRegistrationData(parsedData)
    } catch (err) {
      console.error("Error parsing registration data:", err)
      navigate("/register")
    }
  }, [navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setError("Vui lòng nhập đầy đủ họ và tên")
      return
    }

    if (!registrationData) {
      setError("Dữ liệu đăng ký không hợp lệ. Vui lòng thử lại.")
      return
    }

    setIsLoading(true)

    try {
      // Complete registration with all data
      const registerData = {
        email: registrationData.email,
        password: registrationData.password,
        firstName: firstName,
        lastName: lastName,
      }

      // Call register API
      await register(registerData)

      // After successful registration, log the user in
      await login(registrationData.email, registrationData.password)
      const user = await getCurrentUser()
      setCurrentUser(user)

      // Clear session storage
      sessionStorage.removeItem("registrationData")

      // Navigate to home page
      navigate("/")
    } catch (err) {
      setError("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.")
      console.error("Registration error:", err)
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
                Thiết lập hồ sơ
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chỉ còn một bước nữa để hoàn tất đăng ký
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ width: "100%", mb: 4 }}>
            <Stepper activeStep={1} alternativeLabel>
              <Step completed>
                <StepLabel>Tạo tài khoản</StepLabel>
              </Step>
              <Step active>
                <StepLabel>Thiết lập hồ sơ</StepLabel>
              </Step>
              <Step>
                <StepLabel>Hoàn tất</StepLabel>
              </Step>
            </Stepper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.light",
                mb: 2,
              }}
            >
              <PersonOutline sx={{ fontSize: 40 }} />
            </Avatar>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {registrationData && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Đăng ký với email: {registrationData.email}
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2, flexDirection: isMobile ? "column" : "row" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="lastName"
                label="Họ"
                name="lastName"
                autoComplete="family-name"
                autoFocus
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                id="firstName"
                label="Tên"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
              Tên của bạn sẽ được hiển thị trên hồ sơ và trong các hoạt động của bạn.
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
              {isLoading ? "Đang xử lý..." : "Hoàn tất đăng ký"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProfileSetupPage
