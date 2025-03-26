"use client"

import type React from "react"
import { useState } from "react"
import { Avatar, Box, Button, Card, CardContent, Divider, type SxProps, TextField, type Theme } from "@mui/material"
import { Image, Send, Videocam } from "@mui/icons-material"
import { useCurrentUser } from "../../../contexts/currentUserContext"
import type { Post } from "../../../types/post"

interface CreatePostProps {
  onPostCreated: (post: Post) => void
  className?: string
  sx?: SxProps<Theme>
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated, className, sx }) => {
  const [content, setContent] = useState<string>("")
  const { currentUser } = useCurrentUser() ?? {}

  const handleCreatePost = () => {
    if (!content.trim()) return

    const newPost: Post = {
      id: Date.now(),
      user: {
        id: currentUser?.id || 999,
        name: currentUser?.name || "Người dùng",
        avatar: currentUser?.avatar || "https://i.pravatar.cc/150?img=3",
        email: currentUser?.email || "",
      },
      content,
      timestamp: "Vừa xong",
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
    }

    onPostCreated(newPost)
    setContent("")
  }

  return (
    <Card className={className} sx={sx}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar src={currentUser?.avatar} sx={{ mr: 1.5 }} />
          <TextField
            fullWidth
            placeholder="Bạn đang nghĩ gì?"
            multiline
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Button startIcon={<Image />} sx={{ mr: 1, textTransform: "none" }}>
              Ảnh/Video
            </Button>
          </Box>
          <Button
            variant="contained"
            endIcon={<Send />}
            onClick={handleCreatePost}
            disabled={!content.trim()}
            sx={{
              bgcolor: "#4f46e5",
              "&:hover": { bgcolor: "#4338ca" },
              textTransform: "none",
            }}
          >
            Đăng
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CreatePost

