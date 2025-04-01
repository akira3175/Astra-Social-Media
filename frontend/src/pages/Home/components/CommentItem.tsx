import React, { useState } from 'react';
import { Avatar, Box, Typography, Button, TextField, Link } from '@mui/material';
import { Comment } from '../../../types/comment';
import { usePostStore } from '../../../stores/postStore'; // Import store for addComment

interface CommentItemProps {
  comment: Comment;
  postId: number; // Need postId to add a reply
  level?: number; // Indentation level for replies
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
  const addComment = usePostStore((state) => state.addComment);

  const handleAddReply = async () => {
    if (replyContent.trim()) {
      // Call addComment with the parentId set to the current comment's id
      await addComment(postId, replyContent.trim(), undefined, comment.id);
      setReplyContent(''); // Clear input
      setShowReplyInput(false); // Hide input after replying
    }
  };

  const maxIndentLevel = 3; // Limit indentation depth
  const currentIndent = Math.min(level, maxIndentLevel) * 20; // Indentation in pixels (e.g., 20px per level)

  return (
    <Box sx={{ pl: `${currentIndent}px`, mb: 2 }}> {/* Apply indentation */}
      {/* Main Comment Content */}
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
              display: 'inline-block',
              maxWidth: '100%',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1, display: 'inline' }}>
              {comment.user.username}
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: 'inline' }}
            >
              {' '}{comment.content} {/* Add space */}
            </Typography>
          </Box>
          {/* Actions: Like (placeholder), Reply, Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, ml: 0.5 }}>
            {/* Placeholder for Like button */}
            {/* <Link href="#" variant="caption" underline="hover" sx={{ fontWeight: 'bold' }}>Thích</Link> */}
            <Link
              href="#"
              variant="caption"
              underline="hover"
              sx={{ fontWeight: 'bold' }}
              onClick={(e) => {
                e.preventDefault();
                setShowReplyInput(!showReplyInput);
                setReplyContent(''); // Clear content when toggling
              }}
            >
              Trả lời
            </Link>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(comment.createdAt)}
            </Typography>
          </Box>

          {/* Reply Input Area */}
          {showReplyInput && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 0.5 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder={`Trả lời ${comment.user.username}...`}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                autoFocus // Focus the input when it appears
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddReply();
                  }
                }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleAddReply}
                disabled={!replyContent.trim()}
              >
                Gửi
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Render Replies Recursively */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ mt: 1.5 }}> {/* Add margin top for replies */}
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} level={level + 1} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentItem;
