import type React from "react"
import { Box, Typography, Paper } from "@mui/material"
import Post from "../../Home/components/Post"
import PostSkeleton from "../../Home/components/PostSkeleton"
import type { Post as PostType } from "../../../types/post"

interface ProfilePostListProps {
  posts: PostType[]
  isLoading: boolean
  onLikePost: (id: number) => void
  onSavePost: (id: number) => void
  className?: string
}

const ProfilePostList: React.FC<ProfilePostListProps> = ({ posts, isLoading, onLikePost, onSavePost, className }) => {
  // Render skeletons when loading
  if (isLoading) {
    return (
      <Box className={className}>
        {/* Show 3 skeleton posts while loading */}
        {[...Array(3)].map((_, index) => (
          <PostSkeleton key={index} sx={{ mb: 3 }} />
        ))}
      </Box>
    )
  }

  // Render empty state if no posts
  if (posts.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Bài viết</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Typography variant="body1" color="text.secondary">
            Chưa có bài viết nào.
          </Typography>
        </Box>
      </Paper>
    )
  }

  // Render actual posts when loaded
  return (
    <Box className={className}>
      {posts.map((post) => (
        <Post
          key={post.id}
          id={post.id}
          user={post.user}
          content={post.content}
          image={post.image}
          timestamp={post.timestamp}
          likes={post.likes}
          comments={post.comments}
          liked={post.liked}
          saved={post.saved}
          onLike={onLikePost}
          onSave={onSavePost}
          sx={{ mb: 3 }}
        />
      ))}
    </Box>
  )
}

export default ProfilePostList

