import React, { useState } from "react"
import { Box, Typography, TextField, Button, Container, Grid, useTheme, useMediaQuery, Card, CardHeader, CardContent, InputAdornment, IconButton, Divider } from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import logo from "../../assets/logo.jpeg"
import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon,
    Google as GoogleIcon,
  } from "@mui/icons-material"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()

  const handleClickShowPassword = () => setShowPassword((show) => !show)
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show)
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }
  
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    
  }



  return (
    <Box
      sx={{
        minHeight: "100vh",
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
                  Connect with friends and the world around you on AstraSocial.
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
              <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
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
                  sx={{
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0px 1000px white inset",
                      transition: "background-color 5000s ease-in-out 0s",
                      WebkitTextFillColor: "black !important",
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="off"
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
                  sx={{
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: "0 0 0px 1000px white inset",
                      transition: "background-color 5000s ease-in-out 0s",
                      WebkitTextFillColor: "black !important",
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Nhập lại mật khẩu"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="off"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowConfirmPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}  
                sx={{
                    "& input:-webkit-autofill": {
                        WebkitBoxShadow: "0 0 0px 1000px white inset",
                        transition: "background-color 5000s ease-in-out 0s",
                        
                    }
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
                    >
                      Đăng ký ngay
                    </Typography>
                  </Typography>
                </Box>
                <Box sx={{ position: "relative", my: 3 }}>
                  <Divider>
                    <Typography variant="caption" sx={{ px: 1, color: "text.secondary", textTransform: "uppercase" }}>
                      Hoặc đăng nhập với
                    </Typography>
                  </Divider>
                </Box>
                <Grid container spacing={1}>
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
