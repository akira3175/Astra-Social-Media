"use client"

import React, { useEffect, useLayoutEffect } from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import BasePage from "../Base/BasePage"
import LeftSidebar from "./components/LeftSidebar"
import RightSidebar from "./components/RightSidebar"
import CreatePost from "./components/CreatePost"
import PostList from "./components/PostList"
import MobileBottomNav from "./components/MobileBottomNav"
import { usePostStore } from "../../stores/postStore"
import { useCurrentUser } from "../../contexts/currentUserContext" // Import useCurrentUser

const HomePage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"))

  const { posts, isLoading, fetchPosts, likePost, savePost, setLoading } = usePostStore()
  const { currentUser } = useCurrentUser() // Get currentUser
  const [isLayoutReady, setIsLayoutReady] = React.useState<boolean>(false)

  // Sử dụng useLayoutEffect để đảm bảo layout ổn định trước khi render
  useLayoutEffect(() => {
    // Đánh dấu layout đã sẵn sàng
    setIsLayoutReady(true)
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

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
          <CreatePost sx={{ mb: 3 }} />
          <PostList 
            posts={posts} 
            isLoading={isLoading} 
            onLikePost={(postId) => { // Create new handler
              if (currentUser?.id) {
                likePost(postId, currentUser.id); // Call store action with userId
              } else {
                console.error("Cannot like post: User ID not found.");
              }
            }} 
            onSavePost={savePost}
          />

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
