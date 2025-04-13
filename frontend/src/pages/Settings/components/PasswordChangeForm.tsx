"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Paper,
} from "@mui/material"
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material"
import { changePassword } from "../../../services/authService"

const PasswordChangeForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Password validation
  const [passwordErrors, setPasswordErrors] = useState<{
    length?: string
    match?: string
    letter?: string
    number?: string
  }>({})
  
  const validatePassword = () => {
    const errors: {
      length?: string
      match?: string
      number?: string
      letter?: string
    } = {}

    // Check password length
    if (newPassword.length < 8) {
      errors.length = "Mật khẩu phải có ít nhất 8 ký tự"
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      errors.match = "Mật khẩu mới và xác nhận mật khẩu không khớp"
    }

    // Check for uppercase and lowercase letter
    if (!(/[A-Z]/.test(newPassword) || /[a-z]/.test(newPassword))) {
      errors.letter = "Mật khẩu phải chứa ít nhất một chữ cái viết hoa hoặc thường";
    }    

    // Check for number
    if (!/\d/.test(newPassword)) {
      errors.number = "Mật khẩu phải chứa ít nhất một chữ số"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate password
    if (!validatePassword()) {
      return
    }

    setIsLoading(true)

    try {
      // Call the changePassword function from authService
      await changePassword(currentPassword, newPassword)

      // Clear form and show success message
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSuccess("Mật khẩu đã được thay đổi thành công!")
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Không thể thay đổi mật khẩu. Vui lòng thử lại.")
      } else {
        setError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
        <Lock sx={{ mr: 1 }} />
        Đổi mật khẩu
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu với người khác.
      </Typography>

      <Divider sx={{ my: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          name="currentPassword"
          label="Mật khẩu hiện tại"
          type={showCurrentPassword ? "text" : "password"}
          id="currentPassword"
          value={currentPassword}
          autoComplete="off"
          onChange={(e) => setCurrentPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="newPassword"
          label="Mật khẩu mới"
          type={showNewPassword ? "text" : "password"}
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={Object.keys(passwordErrors).length > 0 && newPassword !== ""}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
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
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!passwordErrors.match && confirmPassword !== ""}
          helperText={confirmPassword !== "" ? passwordErrors.match : ""}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {newPassword !== "" && (
          <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: "background.default" }}>
            <Typography variant="subtitle2" gutterBottom>
              Yêu cầu mật khẩu:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Box
                component="li"
                sx={{
                  color: passwordErrors.length ? "error.main" : "success.main",
                  mb: 0.5,
                }}
              >
                Ít nhất 8 ký tự
              </Box>
              <Box
                component="li"
                sx={{
                  color: passwordErrors.letter ? "error.main" : "success.main",
                  mb: 0.5,
                }}
              >
                Ít nhất một chữ cái viết hoa hay thường
              </Box>
              <Box
                component="li"
                sx={{
                  color: passwordErrors.number ? "error.main" : "success.main",
                  mb: 0.5,
                }}
              >
                Ít nhất một chữ số
              </Box>
            </Box>
          </Paper>
        )}

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
        >
          {isLoading ? <CircularProgress size={24} /> : "Đổi mật khẩu"}
        </Button>
      </Box>
    </Box>
  )
}

export default PasswordChangeForm
