"use client"

import type React from "react"
import { useState, useEffect, useLayoutEffect } from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import BasePage from "../Base/BasePage"
import LeftSidebar from "./components/LeftSidebar"
import RightSidebar from "./components/RightSidebar"
import CreatePost from "./components/CreatePost"
import PostList from "./components/PostList"
import MobileBottomNav from "./components/MobileBottomNav"
import type { Post } from "../../types/post"

// Giả lập dữ liệu bài đăng
const DUMMY_POSTS: Post[] = [
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
  {
    id: 3,
    user: {
      id: 103,
      name: "Lê Văn C",
      avatar: "https://i.pravatar.cc/150?img=8",
      email: "",
    },
    content: "Đang thưởng thức một tách cà phê buổi sáng và đọc sách. Những khoảnh khắc bình yên.",
    image: "https://source.unsplash.com/random/600x400?coffee",
    timestamp: "8 giờ trước",
    likes: 18,
    comments: 3,
    liked: false,
    saved: false,
  },
  // Thêm nhiều bài đăng hơn để test scroll
  {
    id: 4,
    user: {
      id: 104,
      name: "Hoàng Văn D",
      avatar: "https://i.pravatar.cc/150?img=4",
      email: "",
    },
    content: "Vừa hoàn thành một dự án lớn sau nhiều tháng làm việc. Cảm thấy rất hài lòng với kết quả!",
    image: "https://source.unsplash.com/random/600x400?work",
    timestamp: "1 ngày trước",
    likes: 56,
    comments: 8,
    liked: false,
    saved: false,
  },
  {
    id: 5,
    user: {
      id: 105,
      name: "Nguyễn Thị E",
      avatar: "https://i.pravatar.cc/150?img=9",
      email: "",
    },
    content: "Cuối tuần này có ai muốn đi xem phim không? Có bộ phim mới ra rất hay!",
    timestamp: "2 ngày trước",
    likes: 32,
    comments: 15,
    liked: true,
    saved: false,
  },
  {
    id: 6,
    user: {
      id: 106,
      name: "Trần Văn F",
      avatar: "https://i.pravatar.cc/150?img=12",
      email: "",
    },
    content: "Vừa đọc xong một cuốn sách rất hay về phát triển bản thân. Ai cần tên sách thì comment nhé!",
    image: "https://source.unsplash.com/random/600x400?book",
    timestamp: "3 ngày trước",
    likes: 45,
    comments: 23,
    liked: false,
    saved: true,
  },
]

const HomePage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"))

  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false)

  // Sử dụng useLayoutEffect để đảm bảo layout ổn định trước khi render
  useLayoutEffect(() => {
    // Đánh dấu layout đã sẵn sàng
    setIsLayoutReady(true)
  }, [])

  useEffect(() => {
    // Giả lập việc tải dữ liệu
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

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

  // Nếu layout chưa sẵn sàng, hiển thị container trống với kích thước cố định
  if (!isLayoutReady) {
    return (
      <BasePage>
        <Box
          className="layout-container"
          sx={{
            width: "100%",
            height: "100vh",
            visibility: "hidden",
          }}
        />
      </BasePage>
    )
  }

  return (
    <BasePage>
      <Box
        className="layout-container"
        sx={{
          width: "100%",
          maxWidth: "1400px",
          mx: "auto",
          px: { xs: 1, md: 2 },
          boxSizing: "border-box",
          display: "flex",
          position: "relative",
          height: "95vh", // Chiều cao = viewport - navbar
        }}
      >
        {/* Left sidebar - Navigation */}
        {!isMobile && (
          <Box
            sx={{
              width: { md: "280px", lg: "300px" },
              flexShrink: 0,
              position: "sticky",
              top: 0,
              height: "calc(100vh - 140px)",
              overflowY: "auto", // Thanh cuộn riêng cho sidebar
              pr: 1,
              // Tùy chỉnh thanh cuộn
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.2)",
              },
            }}
          >
            <LeftSidebar />
          </Box>
        )}

        {/* Main feed */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto", // Thanh cuộn riêng cho feed
            px: { xs: 0, md: 2 },
            height: "calc(100vh - 140px)",
            // Tùy chỉnh thanh cuộn
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "rgba(0,0,0,0.1)",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "rgba(0,0,0,0.2)",
            },
          }}
        >
          <CreatePost onPostCreated={handleCreatePost} sx={{ mb: 3 }} />
          <PostList posts={posts} isLoading={isLoading} onLikePost={handleLikePost} onSavePost={handleSavePost} />

          {/* Thêm padding dưới cùng để tránh bị che khi scroll đến cuối */}
          <Box sx={{ height: isMobile ? "80px" : "20px" }} />
        </Box>

        {/* Right sidebar - Suggestions */}
        {!isSmallScreen && (
          <Box
            sx={{
              width: { lg: "280px", xl: "300px" },
              flexShrink: 0,
              position: "sticky",
              top: 0,
              height: "calc(100vh - 140px)",
              overflowY: "auto", // Thanh cuộn riêng cho sidebar
              pl: 2,
              pr: 1,
              // Tùy chỉnh thanh cuộn
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.2)",
              },
            }}
          >
            <RightSidebar />
          </Box>
        )}
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && <MobileBottomNav />}
    </BasePage>
  )
}

export default HomePage

