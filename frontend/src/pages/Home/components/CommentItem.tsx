import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Box, Typography, Button, TextField, Link, IconButton, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder, Image, Close as CloseIcon } from '@mui/icons-material';
import { Comment } from '../../../types/comment';
import { usePostStore } from '../../../stores/postStore';
import { uploadToCloudinary } from '../../../utils/uploadUtils';
import ExpandableText from '../../../components/ExpandableText';
import { getImageUrl } from '../../../utils/imageUtils';
interface CommentItemProps {
  comment: Comment;
  postId: number;
  level?: number;
}

// Basic date formatting function
const formatDateTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return isoString;
  }
};

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, level = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { likeComment, unlikeComment, addComment } = usePostStore();

  // Thêm state optimistic update
  const [optimisticUpdate, setOptimisticUpdate] = useState<{
    isLiked?: boolean;
    likeCount?: number;
  } | null>(null);

  // Tính toán giá trị hiển thị
  const displayLiked = optimisticUpdate?.isLiked ?? comment.isLiked;
  const displayLikeCount = optimisticUpdate?.likeCount ?? comment.likeCount;

  const handleAddReply = async () => {
    if (replyContent.trim() || selectedFile) {
      setIsUploading(true);
      try {
        let imageUrls: string[] | undefined;
        if (selectedFile) {
          imageUrls = await uploadToCloudinary([selectedFile]);
        }

        await addComment(postId, replyContent.trim(), imageUrls, comment.id);
        setReplyContent('');
        setSelectedFile(null);
        setShowReplyInput(false);
      } catch (error) {
        console.error('Error adding reply:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };
  // Sửa lại hàm handleLike
  const handleLike = async () => {
    try {
      // Cập nhật UI ngay lập tức
      const newLiked = !displayLiked;
      const newCount = displayLikeCount + (newLiked ? 1 : -1);
      
      setOptimisticUpdate({
        isLiked: newLiked,
        likeCount: newCount
      });

      // Gọi API
      if (newLiked) {
        await likeComment(postId, comment.id);
      } else {
        await unlikeComment(postId, comment.id);
      }
    } catch (error) {
      // Reset về trạng thái ban đầu nếu có lỗi
      setOptimisticUpdate(null);
      console.error('Error toggling comment like:', error);
    }
  };

  // Thêm useEffect để reset optimistic update
  useEffect(() => {
    setOptimisticUpdate(null);
  }, [comment.id, comment.isLiked, comment.likeCount]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const maxIndentLevel = 3;
  const currentIndent = Math.min(level, maxIndentLevel) * 20;

  return (
    <Box sx={{ pl: `${currentIndent}px`, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Avatar
          src={getImageUrl(comment.user.avatar) || undefined}
          alt={comment.user.username}
          sx={{ width: 32, height: 32, mt: 0.5 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              backgroundColor: 'grey.100',
              borderRadius: '12px',
              p: 1.5,
              maxWidth: '100%',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 'bold', 
                mr: 1, 
                display: 'block',  // Changed from inline to block
                mb: 0.5  // Add margin bottom for spacing
              }}
            >
              {/* Hiển thị đầy đủ tên thay vì username */}
              {`${comment.user.firstName} ${comment.user.lastName}`}
            </Typography>
            <ExpandableText text={comment.content} maxLines={2} />

            {/* Thêm phần hiển thị ảnh của comment */}
            {comment.images && comment.images.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {comment.images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 200,
                      height: 200,
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`Comment image ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, ml: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{ 
                color: displayLiked ? 'red' : 'inherit',
                '&:hover': { color: displayLiked ? '#d32f2f' : '#f44336' }
              }}
            >
              {displayLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="caption" sx={{ ml: 0.5 }}>
              {displayLikeCount}
            </Typography>

            <Link
              href="#"
              variant="caption"
              underline="hover"
              sx={{ fontWeight: 'bold' }}
              onClick={(e) => {
                e.preventDefault();
                setShowReplyInput(!showReplyInput);
                setReplyContent('');
              }}
            >
              Trả lời
            </Link>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {formatDateTime(comment.createdAt)}
            </Typography>
          </Box>

          {showReplyInput && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1, ml: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder={`Trả lời ${comment.user.firstName} ${comment.user.lastName}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  multiline
                  maxRows={4}
                  disabled={isUploading}
                />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Image />
                </IconButton>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddReply}
                  disabled={(!replyContent.trim() && !selectedFile) || isUploading}
                >
                  {isUploading ? <CircularProgress size={20} /> : 'Gửi'}
                </Button>
              </Box>

              {/* Image preview */}
              {selectedFile && (
                <Box sx={{ position: 'relative', width: 100, height: 100, mt: 1 }}>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                    onClick={handleRemoveFile}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} level={level + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentItem;
