import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Typography,
  Divider,
  Fade, // Thêm Fade component
  Skeleton // Thêm Skeleton component
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PostService } from '../../../services/PostService';
import Post from './Post';
import CommentItem from './CommentItem';
import type { Post as PostType } from '../../../types/post';
import { usePostStore } from '../../../stores/postStore';

const LoadingSkeleton = () => (
  <Box sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="text" width="20%" height={15} />
      </Box>
    </Box>
    <Skeleton variant="rectangular" width="100%" height={300} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Skeleton variant="text" width="15%" />
      <Skeleton variant="text" width="15%" />
      <Skeleton variant="text" width="15%" />
    </Box>
  </Box>
);

const PostDetailModal = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { savePost, repostPost, commentDataByPostId, isLoadingComments } = usePostStore();
  const comments = commentDataByPostId[Number(id)]?.comments || [];

  // Kiểm tra xem modal có nên mở hay không dựa vào URL
  const isOpen = location.pathname.includes('/post/');

  useEffect(() => {
    const loadPostAndComments = async () => {
      if (!id || !isOpen) return;
      
      try {
        setLoading(true);
        setError(null);
        
        if (isNaN(Number(id))) {
          setError('ID bài viết không hợp lệ');
          return;
        }

        const postData = await PostService.getPostById(Number(id));
        if (!postData) {
          setError('Không tìm thấy bài viết');
          return;
        }
        setPost(postData);
        
        // Load comments
        await usePostStore.getState().fetchComments(Number(id));
      } catch (err) {
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPostAndComments();
  }, [id, isOpen]);

  const handleClose = () => {
    navigate(-1); // Quay lại trang trước đó
  };

  const handleSave = async (postId: number) => {
    try {
      await savePost(postId);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleRepost = async (postId: number, content?: string) => {
    try {
      await repostPost(postId, content);
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  return (
    <Dialog 
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 500 }}
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '80vh',
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <DialogContent sx={{
        padding: 2,
        overflowY: 'auto',
        '&.MuiDialogContent-root': {
          padding: 2
        },
        // Custom scrollbar styles
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
      }}>
        {loading ? (
          <Fade in={loading} timeout={500}>
            <Box>
              <LoadingSkeleton />
              <Box display="flex" justifyContent="center" mt={2}>
                <CircularProgress size={30} />
              </Box>
            </Box>
          </Fade>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <Typography color="error">{error}</Typography>
          </Box>
        ) : post ? (
          <Fade in={!loading} timeout={500}>
            <Box>
              <Post 
                post={post} 
                onSave={handleSave}
                onConfirmRepost={handleRepost}
                defaultShowComments={true} 
              />
            </Box>
          </Fade>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
