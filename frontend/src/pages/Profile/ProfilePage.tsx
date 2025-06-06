"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import {
  Container,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
  IconButton,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Button,
  Menu,
  MenuItem,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import type { User } from "../../types/user"
import { getUserByEmail } from "../../services/authService"
import { useCurrentUser } from "../../contexts/currentUserContext"
import { GradientCircularProgress } from "../../components/ui/GradientCircularProgress"
import NotFound from "../../pages/Status/NotFound"
import BasePage from "../Base/BasePage"
import { updateUserAvatar, updateUserBackground, updateUserName } from "../../services/authService"
import ProfileBio from "./components/ProfileBio"
import ProfilePhotos from "./components/ProfilePhotos"
import ProfileFriends from "./components/ProfileFriends"
import PostList from "../../pages/Home/components/PostList"
import { usePostStore } from "../../stores/postStore"
import CreatePost from "../../pages/Home/components/CreatePost"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import EditIcon from "@mui/icons-material/Edit"
import { Chat } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import { PersonAdd } from "@mui/icons-material"
import friendshipService from "../../services/friendshipService"

const ProfileContainer = styled(Container)(({}) => ({
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
}))

const ProfileScrollContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto", // Thanh cuộn chỉ trong profile
  padding: theme.spacing(2),
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.grey[400],
    borderRadius: "4px",
  },
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
  backgroundColor: theme.palette.grey[400],
}))

const BackgroundImageBox = styled(Box)(({}) => ({
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
  height: "250px",
  paddingTop: theme.spacing(2),
}))

const AvatarContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  marginBottom: theme.spacing(2),
  width: "120px",
  display: "flex",
  justifyContent: "center",
}))

const AvatarBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "-50px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  gap: theme.spacing(1),
  paddingBottom: theme.spacing(2),
}))

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  border: `4px solid ${theme.palette.background.paper}`,
  marginBottom: theme.spacing(2),
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
  "&:focus": {
    outline: "none",
  },
  "&:focus-visible": {
    outline: "none",
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
  "&:focus": {
    outline: "none",
  },
  "&:focus-visible": {
    outline: "none",
  },
}))

const ProfilePage: React.FC = () => {
  const { email } = useParams<{ email: string }>()
  const { currentUser, setCurrentUser } = useCurrentUser()
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [friendshipStatus, setFriendshipStatus] = useState<{
    status: string
    friendshipId: number | null
  } | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const navigate = useNavigate()

  const [openEditModal, setOpenEditModal] = useState(false)
  const [editedFirstName, setEditedFirstName] = useState("")
  const [editedLastName, setEditedLastName] = useState("")

  const { userPosts, isLoadingUserPosts, fetchPostsByUserEmail } = usePostStore()

  const isCurrentUser = useMemo(() => currentUser?.email === profile?.email, [currentUser, profile])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const loadProfile = async () => {
      if (email) {
        try {
          setIsLoading(true)
          const data = await getUserByEmail(email)
          setProfile(data)
          setIsLoading(false)
        } catch (error) {
          console.error("Failed to load profile:", error)
          if (error instanceof AxiosError && error.response?.status === 404) {
            setProfile(null)
          } else {
            setError("Failed to load profile. Please try again.")
          }
          setIsLoading(false)
        }
      }
    }
    loadProfile()
  }, [email, navigate])

  useEffect(() => {
    const loadPosts = async () => {
      if (email && currentUser?.email) {
        await fetchPostsByUserEmail(email)
      }
    }

    loadPosts()
  }, [email, currentUser, fetchPostsByUserEmail])

  useEffect(() => {
    const checkFriendshipStatus = async () => {
      if (profile && !isCurrentUser) {
        try {
          const status = await friendshipService.getFriendshipStatus(profile.id)
          setFriendshipStatus(status)
        } catch (error) {
          console.error("Error checking friendship status:", error)
        }
      }
    }
    checkFriendshipStatus()
  }, [profile, isCurrentUser])

  const handleEditProfile = () => {
    if (profile) {
      setEditedFirstName(profile.firstName || "")
      setEditedLastName(profile.lastName || "")
      setOpenEditModal(true)
    }
  }

  const handleCloseEditModal = () => {
    setOpenEditModal(false)
  }

  const handleSaveProfile = async () => {
    if (profile) {
      setIsUpdating(true)
      try {
        await updateUserName(editedFirstName, editedLastName)
        // Cập nhật profile sau khi lưu thành công
        const updatedProfile = {
          ...profile,
          firstName: editedFirstName,
          lastName: editedLastName,
        }
        setProfile(updatedProfile)
        setOpenEditModal(false)
        setNotification({
          type: "success",
          message: "Tên đã được cập nhật thành công",
        })
        // Cập nhật currentUser nếu đây là người dùng hiện tại
        if (isCurrentUser) {
          setCurrentUser(updatedProfile)
        }
      } catch (error) {
        console.error("Failed to update profile:", error)
        setNotification({
          type: "error",
          message: "Không thể cập nhật tên. Vui lòng thử lại.",
        })
      } finally {
        setIsUpdating(false)
      }
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "background") => {
    const file = event.target.files?.[0] // Lấy file đầu tiên
    if (!file) return

    try {
      let updatedUser
      if (type === "avatar") {
        updatedUser = await updateUserAvatar(file)
      } else {
        updatedUser = await updateUserBackground(file)
      }

      setCurrentUser(updatedUser)
      setProfile(updatedUser)
      setNotification({
        type: "success",
        message: "Ảnh đã được cập nhật thành công",
      })
    } catch (error) {
      setNotification({
        type: "error",
        message: "Không thể cập nhật ảnh hoặc ảnh không hỗ trợ định dạng. Vui lòng thử lại.",
      })
      console.error(`Error updating ${type}:`, error)
    }
  }

  const refreshUserData = async () => {
    if (email) {
      try {
        setIsLoading(true)
        const data = await getUserByEmail(email)
        setProfile(data)
        if (isCurrentUser) {
          setCurrentUser(data)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to refresh profile:", error)
        setError("Failed to refresh profile. Please try again.")
        setIsLoading(false)
      }
    }
  }

  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click()
  }

  const triggerBackgroundUpload = () => {
    backgroundInputRef.current?.click()
  }

  const handleCloseNotification = () => {
    setNotification(null)
  }

  // const handleCreatePost = (newPost: Post) => {
  //   // Sử dụng addPost từ PostStore
  //   usePostStore.getState().addPost(newPost.content, newPost.imageUrls);
  // }

  // const handleLikePost = (postId: number) => {
  //   // Sử dụng likePost từ PostStore
  //   usePostStore.getState().likePost(postId)
  // }

  // const handleSavePost = (postId: number) => {
  //   // Sử dụng savePost từ PostStore
  //   usePostStore.getState().savePost(postId)
  // }

  const handleStartChat = () => {
    if (profile) {
      // Store the user information in sessionStorage with additional flag to open chat directly
      sessionStorage.setItem(
        "messageUser",
        JSON.stringify({
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          avatar: profile.avatar || undefined,
          openChatDirectly: true, // Add this flag to indicate we want to open the chat directly
        }),
      )

      // Navigate to the messages page
      navigate("/messages")
    }
  }

  const handleAddFriend = async () => {
    if (profile) {
      try {
        await friendshipService.sendFriendRequest(profile.email)
        const status = await friendshipService.getFriendshipStatus(profile.id)
        setFriendshipStatus(status)
      } catch (error) {
        console.error("Error sending friend request:", error)
      }
    }
  }

  const handleCancelFriendRequest = async () => {
    if (profile) {
      try {
        await friendshipService.cancelFriendRequest(profile.email)
        setFriendshipStatus(null)
      } catch (error) {
        console.error("Error canceling friend request:", error)
      }
    }
  }

  const handleUnfriend = async () => {
    if (profile && friendshipStatus?.friendshipId) {
      try {
        await friendshipService.removeFriend(friendshipStatus.friendshipId)
        setFriendshipStatus(null)
      } catch (error) {
        console.error("Error unfriending:", error)
      }
    }
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
    return <NotFound />
  }

  return (
    <BasePage>
      <ProfileContainer>
        <ProfileScrollContainer>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : !profile ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <Typography>Profile not found.</Typography>
            </Box>
          ) : (
            <>
              {/* Full width profile header */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <ProfileHeader elevation={3}>
                    <BackgroundImageBox>
                      <BackgroundImage src={profile.background || ""} />
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
                        <AvatarContainer sx={{ marginBottom: "-10px" }}>
                          <ProfileAvatar src={profile.avatar || undefined}>
                            {profile.firstName?.charAt(0)}
                          </ProfileAvatar>
                          {isCurrentUser && (
                            <ChangeAvatarButton onClick={triggerAvatarUpload} size="small" sx={{ bottom: "10px" }}>
                              <CameraAltIcon fontSize="small" />
                            </ChangeAvatarButton>
                          )}
                        </AvatarContainer>

                        <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                          <Typography variant="h5" component="h1">
                            {profile.lastName + " " + profile.firstName}
                          </Typography>
                          {isCurrentUser ? (
                            <IconButton onClick={handleEditProfile} size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          ) : null}
                        </Box>
                        <Typography variant="subtitle1" color="text.secondary">
                          {profile.email}
                        </Typography>
                        {!isCurrentUser && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {friendshipStatus?.status === "ACCEPTED" ? (
                              <>
                                <Button
                                  variant="contained"
                                  startIcon={<PersonAdd />}
                                  onClick={handleClick}
                                  size="medium"
                                  sx={{ mt: 1 }}
                                >
                                  Bạn bè
                                </Button>
                                <Menu
                                  anchorEl={anchorEl}
                                  open={open}
                                  onClose={handleClose}
                                  onClick={handleClose}
                                  transformOrigin={{
                                    horizontal: "right",
                                    vertical: "top",
                                  }}
                                  anchorOrigin={{
                                    horizontal: "right",
                                    vertical: "bottom",
                                  }}
                                >
                                  <MenuItem onClick={handleUnfriend}>Hủy kết bạn</MenuItem>
                                </Menu>
                              </>
                            ) : (
                              <Button
                                variant="contained"
                                startIcon={<PersonAdd />}
                                onClick={
                                  friendshipStatus?.status === "PENDING" ? handleCancelFriendRequest : handleAddFriend
                                }
                                size="medium"
                                sx={{ mt: 1 }}
                              >
                                {friendshipStatus?.status === "PENDING" ? "Hủy lời mời" : "Kết bạn"}
                              </Button>
                            )}
                            <Button
                              variant="contained"
                              startIcon={<Chat />}
                              onClick={handleStartChat}
                              size="medium"
                              sx={{ mt: 1 }}
                            >
                              Nhắn tin
                            </Button>
                          </Box>
                        )}
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
              </Grid>

              {/* Content grid with 80% width */}
              <Box
                sx={{
                  width: isMobile ? "100%" : "80%",
                  maxWidth: "1400px",
                  mx: "auto",
                  mt: 2,
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    {/* Tiểu sử */}
                    <ProfileBio profile={profile} isCurrentUser={isCurrentUser} refreshUserData={refreshUserData} />

                    {/* Danh sách hình ảnh */}
                    <ProfilePhotos user={profile} />

                    {/* Danh sách bạn bè */}
                    <ProfileFriends userEmail={profile?.email} userId={profile?.id} />
                  </Grid>

                  <Grid item xs={12} md={8}>
                    {/* Khung đăng bài */}
                    {isCurrentUser && <CreatePost sx={{ mb: 3 }} />}

                    <PostList posts={userPosts} isLoading={isLoadingUserPosts} className="profile-posts" />
                  </Grid>
                </Grid>
              </Box>
            </>
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
          <Dialog open={openEditModal} onClose={handleCloseEditModal}>
            <DialogTitle>Chỉnh sửa tên</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                <TextField
                  label="Họ"
                  fullWidth
                  value={editedLastName}
                  onChange={(e) => setEditedLastName(e.target.value)}
                  variant="outlined"
                />
                <TextField
                  label="Tên"
                  fullWidth
                  value={editedFirstName}
                  onChange={(e) => setEditedFirstName(e.target.value)}
                  variant="outlined"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditModal}>Hủy</Button>
              <Button onClick={handleSaveProfile} variant="contained" color="primary" disabled={isUpdating}>
                {isUpdating ? "Đang lưu..." : "Lưu"}
              </Button>
            </DialogActions>
          </Dialog>

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
        </ProfileScrollContainer>
      </ProfileContainer>
    </BasePage>
  )
}

export default ProfilePage
