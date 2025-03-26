import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import {
  Container,
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  CircularProgress,
  Paper,
  IconButton,
  Grid,
  Alert,
  Snackbar,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import EditIcon from "@mui/icons-material/Edit"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import { User } from "../../types/user"
import { getUserByEmail } from "../../services/authService"
import { useCurrentUser } from "../../contexts/currentUserContext"
import { GradientCircularProgress } from "../../components/ui/GradientCircularProgress"
import NotFound from "../../pages/Status/NotFound"
import BasePage from "../Base/BasePage"
import { updateUserAvatar, updateUserBackground, updateUserName } from "../../services/authService"

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}))

const ProfileHeader = styled(Paper)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(0),
  marginBottom: theme.spacing(2),
  overflow: "hidden",
}))

const BackgroundImage = styled("img")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "100%",
  width: "100%",
  objectFit: "cover",
  objectPosition: "center",
}))

const BackgroundImageBox = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: "14/3",
}))

const ProfileContent = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "165px",
}))

const AvatarContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(2),
  width: "120px",
  left: "25%",
}))

const AvatarBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "-50px",
}))

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  border: `4px solid ${theme.palette.background.paper}`,
  marginBottom: theme.spacing(2),
}))

const EditButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
}))

const ChangeBackgroundButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(1),
  bottom: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
  zIndex: 2,
}))

const ChangeAvatarButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    backgroundColor: theme.palette.background.default,
  },
}))

const ProfilePage: React.FC = () => {
  const { email } = useParams<{ email: string }>()
  const { currentUser, setCurrentUser } = useCurrentUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  console.log(currentUser)

  useEffect(() => {

    const loadProfile = async () => {
      if (email) {
        try {
          setIsLoading(true)
          const data = await getUserByEmail(email)
          setProfile(data)
          console.log(data)
          setEditedName(data.full_name)
          setIsLoading(false)
        } catch (error) {
          console.error("Failed to load profile:", error)
          if (error instanceof AxiosError && error.response?.status === 404) {
            setProfile(null);
          } else {
            setError("Failed to load profile. Please try again.")
          }
          setIsLoading(false)
        }
      }
    }
    loadProfile()
  }, [email, navigate])

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    // if (profile && username) {
    //   setIsUpdating(true)
    //   try {
    //     await updateFullName(editedName)
    //     const updatedProfile = await fetchProfile(username)
    //     setProfile(updatedProfile)
    //     setIsEditing(false)
    //     setNotification({ type: "success", message: "Profile updated successfully" })
    //     await fetchUserInfo()
    //   } catch (error) {
    //     console.error("Failed to update profile:", error)
    //     setNotification({ type: "error", message: "Failed to update profile. Please try again." })
    //   } finally {
    //     setIsUpdating(false)
    //   }
    // }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "background") => {
    const file = event.target.files?.[0] // Lấy file đầu tiên
    if (!file) return
  
    try {
      let updatedUser;
      if (type === "avatar") {
        updatedUser = await updateUserAvatar(file)
      } else {
        updatedUser = await updateUserBackground(file)
      }

      setCurrentUser(updatedUser)
      setProfile(updatedUser)
    } catch (error) {
      console.error(`Error updating ${type}:`, error)
    }
  };

  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click()
  }

  const triggerBackgroundUpload = () => {
    backgroundInputRef.current?.click()
  }

  const handleCloseNotification = () => {
    setNotification(null)
  }

  if (isLoading) {
    return (
      <BasePage>
        <ProfileContainer>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </ProfileContainer>
      </BasePage>
    )
  }

  if (!profile) {
    return (
      <BasePage>
        <ProfileContainer>
          <NotFound />
        </ProfileContainer>
      </BasePage>
    )
  }

  const isCurrentUser = currentUser?.username === profile.username

  return (
    <BasePage>
    <ProfileContainer>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      ) : !profile ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Profile not found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <ProfileHeader elevation={3}>
            <BackgroundImageBox>
              <BackgroundImage src={profile.background || "/placeholder.svg"} alt="Profile background" />
                {isCurrentUser && (
                  <ChangeBackgroundButton
                    onClick={triggerBackgroundUpload}
                    size="small"
                    sx={{
                      position: "absolute",
                      right: (theme) => theme.spacing(1),
                      bottom: (theme) => theme.spacing(1),
                    }}
                  >
                    <CameraAltIcon fontSize="small" />
                  </ChangeBackgroundButton>
                )}
              </BackgroundImageBox>
              <ProfileContent>
              <AvatarBox>
                  <AvatarContainer sx={{ left: "17%" }}>
                    <ProfileAvatar src={profile.avatar || undefined}>
                      {profile.firstName.charAt(0)}
                    </ProfileAvatar>
                    {isCurrentUser && (
                      <ChangeAvatarButton onClick={triggerAvatarUpload} size="small">
                        <CameraAltIcon fontSize="small" />
                      </ChangeAvatarButton>
                    )}
                  </AvatarContainer>
                  {isEditing ? (
                    <Box display="flex" alignItems="center">
                      <TextField
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                      <Button onClick={handleSaveProfile} variant="contained" color="primary" sx={{ ml: 1 }}>
                        Save
                      </Button>
                    </Box>
                  ) : (
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Typography variant="h5" component="h1">
                        {profile.lastName + ' ' + profile.firstName}
                      </Typography>
                      {isCurrentUser && (
                        <IconButton onClick={handleEditProfile} size="small" sx={{ ml: 1 }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}
                  <Typography variant="subtitle1" color="text.secondary">
                    {profile.email}
                  </Typography>
                </AvatarBox>
              </ProfileContent>
              {isCurrentUser && (
                <>
                  <input
                    ref={avatarInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    id="avatar-upload"
                    type="file"
                    onChange={(e) => handleImageUpload(e, "avatar")}
                  />
                  <input
                    ref={backgroundInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    id="background-upload"
                    type="file"
                    onChange={(e) => handleImageUpload(e, "background")}
                  />
                </>
              )}
            </ProfileHeader>
          </Grid>
          <Grid item xs={12} md={3}>
            {/* <Groups username={profile.username} /> */}
          </Grid>
          <Grid item xs={12} md={9}>
            {/* Add more profile content here */}
          </Grid>
        </Grid>
      )}
      {isUpdating && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(255, 255, 255, 0.7)"
          zIndex={9999}
        >
          <GradientCircularProgress />
        </Box>
      )}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification?.type || "info"} sx={{ width: "100%" }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </ProfileContainer>
    </BasePage>
  )
}

export default ProfilePage