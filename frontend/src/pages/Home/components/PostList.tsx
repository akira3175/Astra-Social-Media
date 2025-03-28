import type React from "react"
import { Box } from "@mui/material"
import Post from "./Post"
import PostSkeleton from "./PostSkeleton"
import type { Post as PostType } from "../../../types/post"

interface PostListProps {
  posts: PostType[]
  isLoading: boolean
  onLikePost: (id: number) => void
  onSavePost: (id: number) => void
  className?: string
}

const PostList: React.FC<PostListProps> = ({ posts, isLoading, onLikePost, onSavePost, className }) => {
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

export default PostList

