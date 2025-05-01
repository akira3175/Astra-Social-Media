import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Box, Typography, Button, TextField, Link, IconButton, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import { Favorite, FavoriteBorder, Image, Close as CloseIcon, MoreVert, Edit, Delete } from '@mui/icons-material';
import { Comment } from '../../../types/comment';
import { usePostStore } from '../../../stores/postStore';
import { uploadToCloudinary } from '../../../utils/uploadUtils';
import ExpandableText from '../../../components/ExpandableText';
import { getImageUrl } from '../../../utils/imageUtils';
import { useCurrentUser } from '../../../contexts/currentUserContext';
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
  const { likeComment, unlikeComment, addComment, updateComment, deleteComment } = usePostStore();
  const { currentUser } = useCurrentUser();
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

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showEditTimer, setShowEditTimer] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Tính thời gian giới hạn chỉnh sửa
  const hasBeenEdited = comment.updatedAt !== null;
  const lastEditTime = hasBeenEdited ? new Date(comment.updatedAt).getTime() : 0;
  const now = new Date().getTime();
  const diffMinutes = hasBeenEdited ? Math.floor((now - lastEditTime) / (1000 * 60)) : 0;
  const remainingMinutes = hasBeenEdited ? Math.max(30 - diffMinutes, 0) : 0;

  const handleEditClick = () => {
    // Nếu comment chưa từng được sửa hoặc đã đủ 30 phút từ lần sửa trước
    if (!hasBeenEdited || remainingMinutes === 0) {
      setIsEditing(true);
      setEditContent(comment.content);
    } else {
      // Hiển thị thông báo thời gian còn lại
      setShowEditTimer(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      setIsUpdating(true);
      await updateComment(postId, comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bình luận này?');
    if (confirmed) {
      try {
        await deleteComment(postId, comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  // Add menu options for edit and delete
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ pl: `${currentIndent}px`, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Avatar
          src={getImageUrl(comment.user.avatar) || undefined}
          alt={comment.user.username}
          sx={{ width: 32, height: 32, mt: 0.5 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          {isEditing ? (
            <Box sx={{ mb: 1 }}>
              <TextField
                fullWidth
                multiline
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                variant="outlined"
                size="small"
                disabled={isUpdating}
              />
              <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button 
                  size="small" 
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                >
                  Hủy
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || isUpdating}
                >
                  {isUpdating ? <CircularProgress size={20} /> : 'Lưu'}
                </Button>
              </Box>
            </Box>
          ) : (
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {`${comment.user.firstName} ${comment.user.lastName}`}
                </Typography>
                {comment.user.email === currentUser?.email && (
                  <IconButton
                    size="small"
                    onClick={handleMenuClick}
                    sx={{ padding: 0.5 }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={() => {
                  handleClose();
                  handleEditClick();
                }}>
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Chỉnh sửa</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                  handleClose();
                  handleDelete();
                }}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Xóa</ListItemText>
                </MenuItem>
              </Menu>
              
              {/* Show edit timer warning */}
              {showEditTimer && remainingMinutes > 0 && (
                <Alert 
                  severity="info" 
                  onClose={() => setShowEditTimer(false)}
                  sx={{ mt: 1, mb: 1 }}
                >
                  Bạn cần đợi {remainingMinutes} phút nữa để có thể sửa bình luận này
                </Alert>
              )}

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
          )}
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
