import type React from "react"
import { Box, Paper, Typography } from "@mui/material"
import Post from "./Post"
import PostSkeleton from "./PostSkeleton"
import type { Post as PostType } from "../../../types/post"
import { usePostStore } from "../../../stores/postStore"

interface PostListProps {
  posts: PostType[]
  isLoading: boolean
  className?: string
}

const PostList: React.FC<PostListProps> = ({ 
  posts, 
  isLoading,
  className 
}) => {
  const { savePost, repostPost } = usePostStore();

  const handleSave = async (postId: number) => {
    try {
      await savePost(postId);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleRepost = async (originalPostId: number, comment?: string) => {
    try {
      await repostPost(originalPostId, comment);
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

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
  console.log("Posts loaded:", posts)
  // Render actual posts when loaded
  return (
    <Box className={className}>
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          onSave={handleSave}
          onConfirmRepost={handleRepost}
          sx={{ mb: 3 }}
        />
      ))}
    </Box>
  )
}

export default PostList
