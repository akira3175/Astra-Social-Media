import type React from "react"
import { useState, useEffect, useRef } from "react"
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
} from "@mui/material"
import { styled } from "@mui/material/styles"
import EditIcon from "@mui/icons-material/Edit"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import { Chat } from "@mui/icons-material"
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
import ProfileCreatePost from "./components/ProfileCreatePost"
import ProfilePostList from "./components/ProfilePostList"
import type { Post } from "../../types/post"
import ChatBox from "../../components/ChatBox/ChatBox"

const ProfileContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
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
}));

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

  const [openEditModal, setOpenEditModal] = useState(false)
  const [editedFirstName, setEditedFirstName] = useState("")
  const [editedLastName, setEditedLastName] = useState("")

  // Dữ liệu mẫu cho bài đăng
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: {
        id: 101,
        name: "Nguyễn Văn A",
        avatar: "https://i.pravatar.cc/150?img=1",
        email: "",
      },
      content: "Hôm nay là một ngày tuyệt vời! #sunshine #happy",
      image: "https://source.unsplash.com/random/600x400?nature",
      timestamp: "2 giờ trước",
      likes: 24,
      comments: 5,
      liked: false,
      saved: true,
    },
    {
      id: 2,
      user: {
        id: 102,
        name: "Trần Thị B",
        avatar: "https://i.pravatar.cc/150?img=5",
        email: "",
      },
      content:
        "Vừa hoàn thành dự án mới! Rất hào hứng để chia sẻ với mọi người về những gì chúng tôi đã làm được. Đây là kết quả của nhiều tháng làm việc chăm chỉ và sáng tạo. #project #achievement #teamwork",
      timestamp: "5 giờ trước",
      likes: 42,
      comments: 12,
      liked: true,
      saved: false,
    },
  ])

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | null>(null)

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
        const updatedProfile = { ...profile, firstName: editedFirstName, lastName: editedLastName }
        setProfile(updatedProfile)
        setOpenEditModal(false)
        setNotification({ type: "success", message: "Tên đã được cập nhật thành công" })
        // Cập nhật currentUser nếu đây là người dùng hiện tại
        if (isCurrentUser) {
          setCurrentUser(updatedProfile)
        }
      } catch (error) {
        console.error("Failed to update profile:", error)
        setNotification({ type: "error", message: "Không thể cập nhật tên. Vui lòng thử lại." })
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
      setNotification({ type: "success", message: "Ảnh đã được cập nhật thành công" })
    } catch (error) {
      setNotification({ type: "error", message: "Không thể cập nhật ảnh hoặc ảnh không hỗ trợ định dạng. Vui lòng thử lại." })
      console.error(`Error updating ${type}:`, error)
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

  const handleCreatePost = (newPost: Post) => {
    setPosts([newPost, ...posts])
  }

  const handleLikePost = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          }
        }
        return post
      }),
    )
  }

  const handleSavePost = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            saved: !post.saved,
          }
        }
        return post
      }),
    )
  }

  const handleStartChat = () => {
    if (profile) {
      setSelectedReceiverId(profile.id.toString())
      setIsChatOpen(true)
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
    return (
      <NotFound />
    )
  }

  // Đến đây nghĩa là profile không phải null
  const isCurrentUser = currentUser?.id === profile.id
  console.log("Current user:", currentUser)
  console.log("Profile:", profile)
  console.log("Is current user:", isCurrentUser)

  return (
    <BasePage>
      <ProfileContainer>
        <ProfileScrollContainer>
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
                      <ProfileAvatar src={profile.avatar || undefined}>{profile.firstName.charAt(0)}</ProfileAvatar>
                      {isCurrentUser && (
                        <ChangeAvatarButton onClick={triggerAvatarUpload} size="small">
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
                      <Button
                        variant="contained"
                        startIcon={<Chat />}
                        onClick={handleStartChat}
                        size="medium"
                        sx={{ mt: 1 }}
                      >
                        Nhắn tin
                      </Button>
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
            <Grid item xs={12} md={4}>
              {/* Tiểu sử */}
              <ProfileBio profile={profile} isCurrentUser={isCurrentUser} />

              {/* Danh sách hình ảnh */}
              <ProfilePhotos />

              {/* Danh sách bạn bè */}
              <ProfileFriends />
            </Grid>

            <Grid item xs={12} md={8}>
              {/* Khung đăng bài */}
              {isCurrentUser && (
                <ProfileCreatePost currentUser={profile} onPostCreated={handleCreatePost} sx={{ mb: 3 }} />
              )}

              {/* Danh sách bài đăng */}
              <ProfilePostList
                posts={posts}
                isLoading={false}
                onLikePost={handleLikePost}
                onSavePost={handleSavePost}
              />
            </Grid>
          </Grid>
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

        {/* ChatBox */}
        <ChatBox
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          receiverId={selectedReceiverId || ""}
          currentUserId={currentUser?.id.toString() || ""}
        />
      </ProfileContainer>
    </BasePage>
  )
}

export default ProfilePage

