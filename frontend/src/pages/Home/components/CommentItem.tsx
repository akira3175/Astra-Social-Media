import React, { useState } from 'react';
import { Avatar, Box, Typography, Button, TextField, Link, IconButton } from '@mui/material';
import { Favorite, FavoriteBorder, AttachFile } from '@mui/icons-material';
import { Comment } from '../../../types/comment';
import { usePostStore } from '../../../stores/postStore';

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
  const { likeComment, unlikeComment, addComment } = usePostStore();

  const handleAddReply = async () => {
    if (replyContent.trim() || selectedFile) {
      try {
        // If there's a file, convert it to image URL first
        let imageUrls: string[] | undefined;
        if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          // const uploadedUrl = await uploadImage(formData); // Implement this function
          // imageUrls = [uploadedUrl];
        }

        await addComment(postId, replyContent.trim(), imageUrls, comment.id);
        setReplyContent('');
        setSelectedFile(null);
        setShowReplyInput(false);
      } catch (error) {
        console.error('Error adding reply:', error);
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
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'inline' }}
            >
              {' '}{comment.content}
            </Typography>
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
            <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 0.5 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={`Trả lời ${comment.user.username}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddReply();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'grey.400',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
              <input
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <IconButton component="span" size="small">
                  <AttachFile />
                </IconButton>
              </label>
              <Button
                variant="contained"
                size="small"
                onClick={handleAddReply}
                disabled={!replyContent.trim() && !selectedFile}
              >
                Gửi
              </Button>
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
