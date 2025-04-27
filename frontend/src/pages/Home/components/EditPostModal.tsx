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
  CircularProgress,
  Alert,
} from '@mui/material';
import { Post } from '../../../types/post';

interface EditPostModalProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  onUpdate: (content: string) => Promise<void>;
  isUpdating: boolean;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, open, onClose, onUpdate, isUpdating }) => {
  const [content, setContent] = useState(post.content);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!content.trim()) return;

    try {
      await onUpdate(content);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Có lỗi xảy ra khi cập nhật bài viết');
      }
    }
  };

  const handleClose = () => {
    setContent(post.content);
    setError(null);
    onClose();
  };

  // Tính thời gian chờ dựa trên lần sửa cuối hoặc thời gian tạo
  const lastEditTime = post.updatedAt 
    ? new Date(post.updatedAt).getTime()
    : new Date(post.createdAt).getTime();
  const now = new Date().getTime();
  const diffMinutes = Math.floor((now - lastEditTime) / (1000 * 60));
  const remainingMinutes = Math.max(30 - diffMinutes, 0);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {remainingMinutes > 0 
              ? `Bạn cần đợi ${remainingMinutes} phút nữa để có thể sửa bài viết này`
              : 'Bạn có thể chỉnh sửa bài viết ngay bây giờ'}
          </Typography>
        </Box>

        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nội dung bài viết..."
          variant="outlined"
          disabled={remainingMinutes > 0 || isUpdating}
        />

        {post.images && post.images.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Ảnh đã đăng không thể chỉnh sửa
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {post.images.map((image) => (
                <Box
                  key={image.id}
                  component="img"
                  src={image.url}
                  sx={{
                    width: 100,
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                    opacity: 0.7
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isUpdating}>
          Hủy
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={!content?.trim() || remainingMinutes > 0 || isUpdating}>
          {isUpdating ? <CircularProgress size={24} /> : 'Cập nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPostModal;