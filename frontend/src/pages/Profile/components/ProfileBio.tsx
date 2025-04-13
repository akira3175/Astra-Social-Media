"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  IconButton,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import WorkOutlineIcon from "@mui/icons-material/WorkOutline"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined"
import type { User } from "../../../types/user"
import { updateUserBio } from "../../../services/authService"

interface ProfileBioProps {
  profile: User
  isCurrentUser: boolean
  refreshUserData?: () => Promise<void>
}

const ProfileBio: React.FC<ProfileBioProps> = ({ profile, isCurrentUser, refreshUserData }) => {
  const [openBioDialog, setOpenBioDialog] = useState(false)
  const [newBio, setNewBio] = useState(profile.bio || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenBioDialog = () => {
    setNewBio(profile.bio || "")
    setError(null)
    setOpenBioDialog(true)
  }

  const handleCloseBioDialog = () => {
    setOpenBioDialog(false)
  }

  const handleSaveBio = async () => {
    setIsUpdating(true)
    setError(null)

    try {
      await updateUserBio(newBio)

      if (refreshUserData) {
        await refreshUserData()
      }

      handleCloseBioDialog()
    } catch (err) {
      setError("Không thể cập nhật tiểu sử. Vui lòng thử lại sau.")
      console.error("Error updating bio:", err)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h6">Giới thiệu</Typography>
        {isCurrentUser && (
          <IconButton size="small" onClick={handleOpenBioDialog}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {profile.bio || "Thêm tiểu sử"}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WorkOutlineIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2">Làm việc tại Công ty ABC</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SchoolOutlinedIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2">Học tại Đại học XYZ</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <HomeOutlinedIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2">Sống tại Hà Nội</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <FavoriteBorderOutlinedIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="body2">Độc thân</Typography>
        </Box>
      </Box>

      <Dialog open={openBioDialog} onClose={handleCloseBioDialog} fullWidth maxWidth="sm">
        <DialogTitle>Chỉnh sửa giới thiệu</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            id="bio"
            label="Giới thiệu về bạn"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            disabled={isUpdating}
            placeholder="Chia sẻ một vài điều về bạn..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBioDialog} disabled={isUpdating}>
            Hủy
          </Button>
          <Button
            onClick={handleSaveBio}
            color="primary"
            variant="contained"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={20} /> : null}
          >
            {isUpdating ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default ProfileBio
