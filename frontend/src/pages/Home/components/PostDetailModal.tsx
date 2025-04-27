import { useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Typography,
  Fade,
  Skeleton,
  Paper,
  Divider,
  useTheme,
  Button,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import Post from "./Post"
import { usePostStore } from "../../../stores/postStore"

const LoadingSkeleton = () => {
  const theme = useTheme()

  return (
    <Box sx={{ p: 2 }}>
      {/* Header skeleton */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Skeleton
          variant="circular"
          width={48}
          height={48}
          sx={{
            mr: 2,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          }}
        />
        <Box sx={{ width: "100%" }}>
          <Skeleton
            variant="text"
            width="40%"
            height={24}
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
            }}
          />
          <Skeleton
            variant="text"
            width="25%"
            height={16}
            sx={{
              bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
            }}
          />
        </Box>
      </Box>

      {/* Content skeleton */}
      <Skeleton
        variant="text"
        width="90%"
        height={20}
        sx={{
          mb: 1,
          bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
        }}
      />
      <Skeleton
        variant="text"
        width="75%"
        height={20}
        sx={{
          mb: 2,
          bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
        }}
      />

      {/* Image skeleton */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={350}
        sx={{
          mb: 2,
          borderRadius: 2,
          bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
        }}
      />

      {/* Actions skeleton */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Skeleton
          variant="rectangular"
          width="28%"
          height={36}
          sx={{
            borderRadius: 1,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          }}
        />
        <Skeleton
          variant="rectangular"
          width="28%"
          height={36}
          sx={{
            borderRadius: 1,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          }}
        />
        <Skeleton
          variant="rectangular"
          width="28%"
          height={36}
          sx={{
            borderRadius: 1,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          }}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Comments section skeleton */}
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        <Skeleton
          variant="text"
          width="30%"
          sx={{
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          }}
        />
      </Typography>

      {/* Comment input skeleton */}
      <Box sx={{ display: "flex", mb: 3, gap: 1 }}>
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={{
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          }}
        />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={48}
          sx={{
            borderRadius: 1,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          }}
        />
      </Box>

      {/* Comments list skeleton */}
      {[1, 2, 3].map((item) => (
        <Box key={item} sx={{ display: "flex", mb: 2 }}>
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{
              mr: 2,
              bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
            }}
          />
          <Box sx={{ width: "100%" }}>
            <Skeleton
              variant="text"
              width="25%"
              height={20}
              sx={{
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
              }}
            />
            <Skeleton
              variant="text"
              width="90%"
              height={16}
              sx={{
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
              }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={16}
              sx={{
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const PostDetailModal = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  // Lấy state và actions từ Zustand store
  const { 
    posts,
    isLoading,
    error,
    fetchPost,
    savePost, 
    repostPost,
    fetchComments 
  } = usePostStore()

  // Lấy post từ store dựa vào id
  const post = posts.find(p => p.id === Number(id))
  const isOpen = location.pathname.includes("/post/")

  useEffect(() => {
    if (!id || !isOpen) return

    if (isNaN(Number(id))) {
      return
    }

    // Fetch post từ store
    fetchPost(Number(id))
    
    // Fetch comments
    fetchComments(Number(id))
  }, [id, isOpen, fetchPost, fetchComments])

  const handleClose = () => {
    navigate(-1)
  }

  const handleSave = async (postId: number) => {
    try {
      await savePost(postId)
    } catch (error) {
      console.error("Error saving post:", error)
    }
  }

  const handleRepost = async (postId: number, content?: string) => {
    try {
      await repostPost(postId, content)
    } catch (error) {
      console.error("Error reposting:", error)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      sx={{
        "& .MuiDialog-paper": {
          minHeight: "80vh",
          maxHeight: "90vh",
          overflow: "hidden",
          borderRadius: { xs: 0, sm: 2 },
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "calc(100% - 32px)" },
          maxWidth: { sm: "600px", md: "800px" },
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        },
        backdropFilter: "blur(5px)",
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleClose}
          aria-label="quay lại"
          sx={{
            mr: 1,
            "&:hover": {
              bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Chi tiết bài viết
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="đóng"
          sx={{
            "&:hover": {
              bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 1, sm: 2 },
          overflowY: "auto",
          bgcolor: theme.palette.mode === "dark" ? "rgba(18, 18, 18, 0.95)" : "rgba(250, 250, 250, 0.95)",
          // Custom scrollbar styles
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {isLoading ? (
          <Fade in={isLoading} timeout={300}>
            <Box>
              <LoadingSkeleton />
              <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={2} sx={{ height: 60 }}>
                <CircularProgress
                  size={40}
                  thickness={4}
                  sx={{
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
            </Box>
          </Fade>
        ) : error ? (
          <Fade in={!isLoading} timeout={300}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50vh",
                bgcolor: theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.5)" : "rgba(250, 250, 250, 0.5)",
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                mx: "auto",
                maxWidth: 500,
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 70,
                  color: theme.palette.error.main,
                  opacity: 0.7,
                  mb: 2,
                }}
              />
              <Typography variant="h6" gutterBottom align="center" sx={{ fontWeight: 600 }}>
                Không thể hiển thị bài viết
              </Typography>
              <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
                {error instanceof Error ? error.message : String(error)}
              </Typography>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Quay lại
              </Button>
            </Paper>
          </Fade>
        ) : post ? (
          <Fade in={!isLoading} timeout={300}>
            <Box sx={{ pt: 1 }}>
              <Post
                post={post}
                onSave={handleSave}
                onConfirmRepost={handleRepost}
                defaultShowComments={true}
                sx={{
                  boxShadow: "none",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.7)" : "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(5px)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow:
                      theme.palette.mode === "dark" ? "0 4px 20px rgba(0, 0, 0, 0.5)" : "0 4px 20px rgba(0, 0, 0, 0.1)",
                  },
                }}
              />
            </Box>
          </Fade>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default PostDetailModal
