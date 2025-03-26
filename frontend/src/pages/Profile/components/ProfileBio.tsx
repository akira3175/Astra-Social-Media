import type React from "react"
import { Box, IconButton, Paper, Typography } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import WorkOutlineIcon from "@mui/icons-material/WorkOutline"
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined"
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined"
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined"
import type { User } from "../../../types/user"

interface ProfileBioProps {
  profile: User
  isCurrentUser: boolean
}

const ProfileBio: React.FC<ProfileBioProps> = ({ profile, isCurrentUser }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h6">Giới thiệu</Typography>
        {isCurrentUser && (
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {profile.bio || "Chào mọi người! Tôi đang sử dụng SocialConnect để kết nối với bạn bè và chia sẻ khoảnh khắc."}
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
    </Paper>
  )
}

export default ProfileBio

