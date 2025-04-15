import React, { useState, useRef } from 'react';
import { Avatar, Box, Typography, Button, TextField, Link, IconButton, CircularProgress } from '@mui/material';
import { Favorite, FavoriteBorder, Image, Close as CloseIcon } from '@mui/icons-material';
import { Comment } from '../../../types/comment';
import { usePostStore } from '../../../stores/postStore';
import { uploadToCloudinary } from '../../../utils/uploadUtils';
import ExpandableText from '../../../components/ExpandableText';

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

  const handleLike = async () => {
    try {
      console.log('Before like/unlike - Comment data:', {
        id: comment.id,
        content: comment.content,
        isLiked: comment.isLiked,
        likeCount: comment.likeCount,
        likes: comment.likes
      });
  
      if (comment.isLiked) {
        await unlikeComment(postId, comment.id);
      } else {
        await likeComment(postId, comment.id);
      }
  
      // Log updated comment data from store
      const updatedCommentData = usePostStore.getState().commentDataByPostId[postId]?.comments
        .find(c => c.id === comment.id);
      
      console.log('After like/unlike - Updated comment data:', {
        id: updatedCommentData?.id,
        content: updatedCommentData?.content,
        isLiked: updatedCommentData?.isLiked,
        likeCount: updatedCommentData?.likeCount,
        likes: updatedCommentData?.likes
      });
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

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
          src={comment.user.avatarUrl || undefined}
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
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1, display: 'inline' }}>
              {comment.user.username}
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
                color: comment.isLiked ? 'red' : 'inherit',
                '&:hover': { color: comment.isLiked ? '#d32f2f' : '#f44336' }
              }}
            >
              {comment.isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="caption" sx={{ ml: 0.5 }}>
                {comment.likeCount}
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
                  placeholder={`Trả lời ${comment.user.username}...`}
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
