import logo from "../../assets/logo.jpeg"
import { useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  Login as LoginIcon,
} from "@mui/icons-material"
import { login, getCurrentUser } from "../../services/authService";
import { useNavigate } from "react-router-dom"
import { useCurrentUser } from "../../contexts/currentUserContext"


export default function LoginPage() {
  const { setCurrentUser } = useCurrentUser();
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await login(email, password)
      const user = await getCurrentUser()
      setCurrentUser(user)

      navigate("/");
    } catch (error) {
      alert("Đăng nhập thất bại!");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom right, #f0f5ff, #f0f5ff)",
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
                  AstraSocial
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
                  Kết nối với bạn bè và thế giới xung quanh trên AstraSocial.
                </Typography>
              </Box>
            </Box>
          </Grid>
        )}

        {/* Right side - Login form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ maxWidth: 450, mx: "auto", boxShadow: 3 }}>
            <CardHeader
              title={
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h5" component="div">
                    Đăng nhập
                  </Typography>
                  {isMobile && (
                    <Typography variant="h6" sx={{ color: "#4f46e5", fontWeight: "bold" }}>
                      AstraSocial
                    </Typography>
                  )}
                </Box>
              }
            />
            <CardContent>
              <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
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
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                  <Typography
                    variant="body2"
                    component="a"
                    href="#"
                    sx={{ color: "#4f46e5", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                  >
                    Quên mật khẩu?
                  </Typography>
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: "#4f46e5",
                    "&:hover": { bgcolor: "#4338ca" },
                  }}
                  startIcon={<LoginIcon />}
                >
                  Đăng nhập
                </Button>
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Typography variant="body2">
                    Chưa có tài khoản?{" "}
                    <Typography
                      component="a"
                      href="#"
                      variant="body2"
                      sx={{
                        color: "#4f46e5",
                        textDecoration: "none",
                        fontWeight: "medium",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() => navigate("/register")}
                    >
                      Đăng ký ngay
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

