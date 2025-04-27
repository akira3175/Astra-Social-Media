import type React from "react"
import { useEffect, useRef } from "react"
import { Box, Typography } from "@mui/material"
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
  className,
}) => {
  const { savePost, repostPost, fetchNextPage, hasMore, error } = usePostStore();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        // Chỉ trigger load more khi không có lỗi
        if (firstEntry.isIntersecting && !isLoading && hasMore && !error) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [isLoading, hasMore, fetchNextPage, error]);

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

  // Giữ nguyên phần render skeleton loading
  if (isLoading && posts.length === 0) {
    return (
      <Box className={className}>
        {[...Array(3)].map((_, index) => (
          <PostSkeleton key={index} sx={{ mb: 3 }} />
        ))}
      </Box>
    )
  }

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

      {/* Lazy loading trigger element - chỉ hiển thị khi không có lỗi */}
      {hasMore && !error && (
        <Box ref={loaderRef} sx={{ height: 10, visibility: 'hidden' }} />
      )}

      {/* Loading indicator for next page */}
      {isLoading && posts.length > 0 && !error && (
        <PostSkeleton sx={{ mb: 3 }} />
      )}

      {/* Error message */}
      {error && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 2, 
          color: 'error.main'
        }}>
          <Typography>
            Không thể tải thêm bài viết
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default PostList
