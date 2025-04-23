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
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material"
import { VerifiedUser, ArrowForward } from "@mui/icons-material"
import { register, requestOtp } from "../../services/authService"
import type { RegisterData } from "../../types/user"

const OTPVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [registrationData, setRegistrationData] = useState<{
    email: string
    password: string
    firstName: string
    lastName: string
  } | null>(null)
  const [countdown, setCountdown] = useState<number>(0)

  const navigate = useNavigate()

  useEffect(() => {
    // Retrieve registration data from session storage
    const storedData = sessionStorage.getItem("registrationData")
    const profileData = sessionStorage.getItem("profileData")

    if (!storedData || !profileData) {
      // If no registration data, redirect back to register page
      navigate("/register")
      return
    }

    try {
      const parsedRegData = JSON.parse(storedData)
      const parsedProfileData = JSON.parse(profileData)
      setRegistrationData({
        ...parsedRegData,
        ...parsedProfileData,
      })

      // Send OTP automatically when page loads
      handleSendOTP()
    } catch (err) {
      console.error("Error parsing registration data:", err)
      navigate("/register")
    }
  }, [navigate])

  useEffect(() => {
    if (registrationData?.email) {
      handleSendOTP()
    }
  }, [registrationData])  

  useEffect(() => {
    // Countdown timer for resend OTP
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOTP = async () => {
    if (!registrationData?.email) return

    setIsSending(true)
    setError(null)
    setSuccess(null)

    try {
      // Call API to send OTP using the existing requestOtp function
      await requestOtp(registrationData.email)
      setSuccess("Mã OTP đã được gửi đến email của bạn")
      setCountdown(60) // 60 seconds countdown for resend
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Không thể gửi mã OTP. Vui lòng thử lại.")
      }
      console.error("Send OTP error:", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyAndSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)

    if (!otp.trim()) {
      setError("Vui lòng nhập mã OTP")
      return
    }

    if (!registrationData) {
      setError("Dữ liệu đăng ký không hợp lệ. Vui lòng thử lại.")
      return
    }

    setIsLoading(true)

    try {
      // Complete registration with all data including OTP
      const registerData: RegisterData = {
        email: registrationData.email,
        password: registrationData.password,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        otp: otp,
      }

      // Call register API
      await register(registerData)

      // Clear session storage
      sessionStorage.removeItem("registrationData")
      sessionStorage.removeItem("profileData")

      // Navigate to home page
      navigate("/")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.")
      }
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
                Xác thực OTP
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng nhập mã OTP đã được gửi đến email của bạn
              </Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ width: "100%", mb: 4 }}>
            <Stepper activeStep={2} alternativeLabel>
              <Step completed>
                <StepLabel>Tạo tài khoản</StepLabel>
              </Step>
              <Step completed>
                <StepLabel>Thiết lập hồ sơ</StepLabel>
              </Step>
              <Step active>
                <StepLabel>Xác thực OTP</StepLabel>
              </Step>
              <Step>
                <StepLabel>Hoàn tất</StepLabel>
              </Step>
            </Stepper>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <VerifiedUser sx={{ fontSize: 80, color: "primary.main" }} />
          </Box>

          <Box component="form" onSubmit={handleVerifyAndSubmit} sx={{ mt: 1 }}>
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

            {registrationData && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Xác thực cho email: {registrationData.email}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Mã OTP"
              name="otp"
              autoComplete="one-time-code"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputProps={{ maxLength: 6 }}
            />

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="text"
                disabled={countdown > 0 || isSending}
                onClick={handleSendOTP}
                sx={{ textTransform: "none" }}
              >
                {isSending ? (
                  <CircularProgress size={20} />
                ) : countdown > 0 ? (
                  `Gửi lại mã sau ${countdown}s`
                ) : (
                  "Gửi lại mã OTP"
                )}
              </Button>
            </Box>

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
              {isLoading ? "Đang xử lý..." : "Xác nhận và hoàn tất"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default OTPVerificationPage
