import logo from "../../assets/logo.jpeg"
import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon,
  Google as GoogleIcon,
} from "@mui/icons-material"
import { checkEmailExists as checkEmailExistsAPI } from "../../services/authService"
import useDebounce from "../../hooks/useDebounce"

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [emailExists, setEmailExists] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null)
  const debouncedEmail = useDebounce(email, 1000)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()

  const handleClickShowPassword = (): void => {
    setShowPassword(!showPassword)
  }

  const handleClickShowConfirmPassword = (): void => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }

  const validatePassword = (): boolean => {
    if (password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự")
      return false
    }

    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp")
      return false
    }

    setPasswordError(null)
    return true
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)

    if (!validatePassword()) {
      return
    }

    if (!agreeToTerms) {
      setError("Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục")
      return
    }

    setIsLoading(true)

    try {
      if (emailExists) {
        setError("Email đã tồn tại")
        return
      }

      // Store registration data in session storage to use in the next step
      sessionStorage.setItem(
        "registrationData",
        JSON.stringify({
          email,
          password,
        }),
      )

      // Navigate to the profile setup page
      navigate("/profile-setup")
    } catch (err) {
      setError("Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.")
      console.error("Registration error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailExists = async (email: string): Promise<void> => {
    const exists = await checkEmailExistsAPI(email)
    setEmailExists(exists)
    if (exists) {
      setEmailError("Email đã tồn tại")
    } else {
      setEmailError(null)
    }
  }

  const emailValidation = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  useEffect(() => {
    if (debouncedEmail.trim() === "") return

    if (!emailValidation(debouncedEmail)) {
      setEmailError("Email không hợp lệ")
      setEmailExists(false)
      return
    }

    setEmailError(null)
    checkEmailExists(debouncedEmail)
  }, [debouncedEmail])

  useEffect(() => {
    if (password === "") {
      setPasswordError(null)
      return
    }
    if (confirmPassword === "") {
      setConfirmPasswordError(null)
      setPasswordError(null)
      return
    }
    if (password.length < 8) {
      setPasswordError("Mật khẩu phải có ít nhất 8 ký tự")
      return
    }
    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu không khớp với mật khẩu xác nhận")
      return
    }
    setPasswordError(null)
  }, [password])

  useEffect(() => {
    if (confirmPassword === "") {
      setConfirmPasswordError(null)
      return
    }
    if (password === "") {
      setPasswordError(null)
      return
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Mật khẩu không khớp với mật khẩu xác nhận")
      return
    }
    if (password === confirmPassword) {
      setConfirmPasswordError(null)
      setPasswordError(null)
    }
  }, [confirmPassword])

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Grid container maxWidth="lg" spacing={3} alignItems="center">
        {/* Left side - Illustration */}
        {!isMobile && (
          <Grid item md={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
              }}
            >
              <Box sx={{ maxWidth: "md", width: "80%" }}>
                <Typography variant="h3" align="center" gutterBottom sx={{ color: "#4f46e5", fontWeight: "bold" }}>
                  Astra Social
                </Typography>
                <Box
                  sx={{
                    aspectRatio: "1/1",
                    background: "linear-gradient(to bottom right, #818cf8, #a855f7)",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                  }}
                >
                  <Box
                    component="img"
                    src={logo}
                    alt="Social connection illustration"
                    sx={{ width: "100%", height: "auto" }}
                  />
                </Box>
                <Typography variant="body1" align="center" sx={{ mt: 3, color: "text.secondary" }}>
                  Kết nối với bạn bè và thế giới xung quanh trên Astra Social.
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Right side - Register form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ maxWidth: 450, mx: "auto", boxShadow: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h5" component="div">
                    Đăng ký tài khoản
                  </Typography>
                  {isMobile && (
                    <Typography variant="h6" sx={{ color: "#4f46e5", fontWeight: "bold" }}>
                      SocialConnect
                    </Typography>
                  )}
                </Box>
              }
              subheader="Tạo tài khoản mới để bắt đầu"
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  auto-compele="off"
                  onChange={(e) => {
                    setEmail(e.target.value)
                  }}
                  type="email"
                  error={!!emailError}
                  helperText={emailError ? emailError : ""}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!passwordError}
                  helperText={passwordError ? passwordError : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
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
                  label="Xác nhận mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!!confirmPasswordError}
                  helperText={confirmPasswordError ? confirmPasswordError : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      value="agreeToTerms"
                      color="primary"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Tôi đồng ý với{" "}
                      <Typography
                        component="a"
                        href="/terms-of-service"
                        variant="body2"
                        sx={{
                          color: "#4f46e5",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Điều khoản dịch vụ
                      </Typography>{" "}
                      và{" "}
                      <Typography
                        component="a"
                        href="/privacy-policy"
                        variant="body2"
                        sx={{
                          color: "#4f46e5",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        Chính sách bảo mật
                      </Typography>
                    </Typography>
                  }
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: "#4f46e5",
                    "&:hover": { bgcolor: "#4338ca" },
                  }}
                  startIcon={<RegisterIcon />}
                >
                  {isLoading ? "Đang xử lý..." : "Tiếp tục"}
                </Button>
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2">
                    Đã có tài khoản?{" "}
                    <Typography
                      component={Link}
                      to="/login"
                      variant="body2"
                      sx={{
                        color: "#4f46e5",
                        textDecoration: "none",
                        fontWeight: "medium",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      Đăng nhập
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ position: "relative", my: 3 }}>
                  <Divider>
                    <Typography variant="caption" sx={{ px: 1, color: "text.secondary", textTransform: "uppercase" }}>
                      Hoặc đăng ký với
                    </Typography>
                  </Divider>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ textTransform: "none" }}>
                      Google
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default RegisterPage
