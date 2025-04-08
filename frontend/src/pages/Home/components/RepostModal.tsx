import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CircularProgress,
} from '@mui/material';
import type { Post as PostType } from '../../../types/post'; 
interface RepostModalProps {
  open: boolean;
  onClose: () => void;
  post: PostType | null; 
  onConfirmRepost: (originalPostId: number, comment?: string) => Promise<void>; 
}

const RepostModal: React.FC<RepostModalProps> = ({ open, onClose, post, onConfirmRepost }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!post) return;
    setIsSubmitting(true);
    try {
      await onConfirmRepost(post.id, comment.trim() || undefined); 
      setComment(''); 
      onClose(); 
    } catch (error) {
      console.error("Failed to repost:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setComment(''); 
      onClose();
    }
  };

  // Basic preview of the original post
  const renderPostPreview = () => {
    if (!post) return null;
    return (
      <Card variant="outlined" sx={{ mt: 1, mb: 2, bgcolor: 'action.hover' }}>
        <CardHeader
          avatar={<Avatar src={post.user?.avatar} alt={post.user?.name} sx={{ width: 32, height: 32 }} />}
          title={post.user?.name || 'Unknown User'}
          subheader={post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
          titleTypographyProps={{ variant: 'body2' }}
          subheaderTypographyProps={{ variant: 'caption' }}
          sx={{ p: 1 }}
        />
        {post.content && (
          <CardContent sx={{ p: 1 }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {post.content}
            </Typography>
          </CardContent>
        )}
        {post.images && post.images.length > 0 && (
          <CardMedia
            component="img"
            image={post.images[0].url} 
            alt="Original post image preview"
            sx={{ maxHeight: 150, objectFit: 'cover', mt: post.content ? 0 : 1 }}
          />
        )}
      </Card>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Đăng lại bài viết</DialogTitle>
      <DialogContent>
        {/* Preview of the original post */}
        {renderPostPreview()}

        {/* Comment input */}
        <TextField
          autoFocus
          margin="dense"
          id="repost-comment"
          label="Thêm bình luận của bạn (tùy chọn)"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>Hủy</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Đăng lại'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepostModal;
