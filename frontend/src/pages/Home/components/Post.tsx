import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card as MuiCard, // Rename Card to avoid conflict if we create an OriginalPostPreview Card
  Button, 
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  CircularProgress, 
  Divider, 
  IconButton,
  ImageList,
  ImageListItem,
  TextField, 
  type SxProps,
  type Theme,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import {
  Bookmark,
  BookmarkBorder,
  Chat,
  Favorite,
  FavoriteBorder,
  Repeat as RepeatIcon, // Import Repeat icon
  Share,
  MoreVert,
} from "@mui/icons-material";
// Removed User and ImageType imports as they come from PostType
import type { Post as PostType } from "../../../types/post"; // Import the main Post type
import { usePostStore } from "../../../stores/postStore";
import CommentItem from "./CommentItem";
import RepostModal from "./RepostModal"; // Import RepostModal
import { useCurrentUser } from '../../../contexts/currentUserContext';

// Define the props for the OriginalPostPreview (can be moved later)
interface OriginalPostPreviewProps {
  post: PostType;
  sx?: SxProps<Theme>;
}

// Sửa lại OriginalPostPreview component
const OriginalPostPreview: React.FC<OriginalPostPreviewProps> = ({ post, sx }) => {
  const displayImages = post.images && post.images.length > 0;
  const isGridDisplay = displayImages && post.images.length > 1;
  const numColumns = post.images ? Math.min(post.images.length, 3) : 1;

  return (
    <MuiCard variant="outlined" sx={{ m: 2, bgcolor: 'action.hover', ...sx }}>
      <CardHeader
        avatar={<Avatar src={post.user?.avatar} alt={post.user?.firstName + ' ' + post.user?.lastName} />}
        title={post.user?.firstName + ' ' + post.user?.lastName || 'Unknown User'}
        subheader={
          post.createdAt 
            ? new Date(post.createdAt).toLocaleString() 
            : ''
        }
        titleTypographyProps={{ 
          variant: 'body1',
          fontWeight: 'bold' 
        }}
        subheaderTypographyProps={{ 
          variant: 'body2' 
        }}
        sx={{ p: 2 }}
      />

      {post.content && (
        <CardContent sx={{ py: 1, px: 2 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              // Xóa các giới hạn kích thước
            }}
          >
            {post.content}
          </Typography>
        </CardContent>
      )}

      {displayImages && (
        <Box sx={{ p: 2, pt: 0 }}>
          {isGridDisplay ? (
            <ImageList
              cols={numColumns}
              gap={8}
              sx={{ width: "100%", height: "auto" }}
            >
              {post.images.slice(0, MAX_GRID_IMAGES).map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image.url}
                    alt={`Original post image ${index + 1}`}
                    loading="lazy"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "auto",
                    }}
                  />
                  {post.images.length > MAX_GRID_IMAGES &&
                    index === MAX_GRID_IMAGES - 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "white",
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        +{post.images.length - MAX_GRID_IMAGES}
                      </Box>
                    )}
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <CardMedia
              component="img"
              image={post.images[0].url}
              alt="Original post image"
              sx={{ 
                width: "100%",
                borderRadius: 1,
                objectFit: "contain"
              }}
            />
          )}
        </Box>
      )}
    </MuiCard>
  );
};


interface PostProps {
  post: PostType
  onSave: (id: number) => void
  onConfirmRepost: (originalPostId: number, comment?: string) => Promise<void>
  className?: string
  sx?: SxProps
}

const MAX_GRID_IMAGES = 4;

const Post: React.FC<PostProps> = ({ post, ...props }) => {
  const { onSave, onConfirmRepost, className, sx } = props;
  const { id, user, content, images, createdAt, likesCount, commentsCount, liked, saved = false, originalPost } = post;

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Get currentUser from context
  const { currentUser } = useCurrentUser();
  const isOwnPost = currentUser?.id === post.user.id;

  // Get deletePost from store
  const { deletePost, isDeletingPost } = usePostStore();
  const isDeleting = isDeletingPost[post.id] || false;

  const displayImages = images && images.length > 0;
  const isGridDisplay = displayImages && images.length > 1;
  const numColumns = images ? Math.min(images.length, 3) : 1;

  // Repost Modal State
  const [isRepostModalOpen, setIsRepostModalOpen] = useState(false);

  // Comment State & Store Integration
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Optimized state selection from Zustand store - use post.id
  const postCommentData = usePostStore((state) => state.commentDataByPostId[post.id]);
  const comments = postCommentData?.comments || [];
  const isLoadingPostComments = usePostStore((state) => state.isLoadingComments[post.id]);
  const fetchComments = usePostStore((state) => state.fetchComments);
  const addComment = usePostStore((state) => state.addComment);

  // Like/Unlike actions - use post.id
  const likePost = usePostStore((state) => state.likePost);
  const unlikePost = usePostStore((state) => state.unlikePost);

  // Repost state from store (isReposting might be useful for disabling button globally, but modal handles its own loading)
  // const isReposting = usePostStore(state => state.isReposting); // We might not need this here if modal handles loading state

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenDeleteConfirm = () => {
    handleCloseMenu(); // Close the menu
    setDeleteConfirmOpen(true);
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      setDeleteConfirmOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
  };

  // useEffect(() => {
  //   console.log('Post ID:', post.id);
  //   console.log('Comments from props:', post.commentsCount);
  //   console.log('Comments from store:', postCommentData?.totalCount);
  //   console.log('Current comments array length:', comments.length);
  // }, [post.id, post.commentsCount, postCommentData, comments]);

  useEffect(() => {
    // Use post.id, post.liked, post.likesCount
    console.log(`Post ${post.id} like status:`, { liked: post.liked, likesCount: post.likesCount });
  }, [post.id, post.liked, post.likesCount]);

  const handleToggleComments = () => {
    const nextShowComments = !showComments;
    setShowComments(nextShowComments);
    // Fetch comments only when expanding and if they haven't been fetched yet and aren't currently loading
    if (
      nextShowComments &&
      !postCommentData &&
      !isLoadingPostComments
    ) {
      fetchComments(post.id); // Use post.id
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await addComment(post.id, newComment.trim()); // Use post.id
      setNewComment("");
    }
  };

  // Like/Unlike handler - use post.id and post.liked
  const handleLike = async () => {
    try {
      if (post.liked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleOpenRepostModal = () => {
    setIsRepostModalOpen(true);
  };


  const isLoadingCurrentComments = isLoadingPostComments ?? false;

  const { repostPost, isReposting } = usePostStore();

  const handleRepost = async (originalPostId: number, comment?: string) => {
    try {
      await repostPost(originalPostId, comment);
      setIsRepostModalOpen(false);
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  return (
    <Card className={className} sx={sx}>
      {/* Show repost indicator với user từ post */}
      {originalPost && (
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', px: 2, pt: 1, pb: 0 }}>
          <RepeatIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">
            {`${post.user.firstName} ${post.user.lastName}`} đã đăng lại
          </Typography>
        </Box>
      )}

      <CardHeader
        avatar={
          <Avatar 
            src={post.user.avatar} 
            alt={`${post.user.firstName} ${post.user.lastName}`} 
          />
        }
        title={`${post.user.firstName} ${post.user.lastName}`}
        subheader={post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
        sx={{
          textAlign: "left",
          pt: originalPost ? 1 : 2,
          "& .MuiCardHeader-content": {
            textAlign: "left",
          },
          "& .MuiCardHeader-subheader": {
            fontSize: "0.8em",
            fontWeight: 500,
          },
        }}
        action={
          isOwnPost && (
            <IconButton 
              aria-label="post settings"
              onClick={handleOpenMenu}
              disabled={isDeleting}
            >
              <MoreVert />
            </IconButton>
          )
        }
      />
      {/* Add Menu component */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleOpenDeleteConfirm}
          disabled={isDeleting}
          sx={{ color: 'error.main' }} // Màu đỏ cho action xóa
        >
          {isDeleting ? 'Đang xóa...' : 'Xóa bài viết'}
        </MenuItem>
      </Menu>
      <CardContent sx={{ textAlign: "left", pt: 0 }}>
        {/* Render post content only if it's not a repost or if repost has content */}
        {(content || !originalPost) && (
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: originalPost ? 1 : 0 }}>
            {content}
          </Typography>
        )}
         {/* Render original post preview if this is a repost */}
         {originalPost && (
           originalPost.isDeleted ? (
             <Box sx={{ 
               p: 2, 
               bgcolor: 'grey.100', 
               borderRadius: 1,
               color: 'text.secondary',
               mt: 1 
             }}>
               <Typography variant="body2">
                 Bài viết gốc đã bị xóa
               </Typography>
             </Box>
           ) : (
             <OriginalPostPreview post={originalPost} />
           )
         )}
      </CardContent>

      {/* Render images only if it's NOT a repost (images belong to original) */}
      { displayImages && (
        <Box sx={{ overflow: "hidden", position: "relative" }}>
          {isGridDisplay ? (
            <ImageList
              cols={numColumns}
              gap={8}
              sx={{ width: "100%", height: "auto" }}
            >
              {images.slice(0, MAX_GRID_IMAGES).map((image, index) => (
                <ImageListItem key={index}>
                  <img
                    src={image.url}
                    alt={`Post image ${index + 1}`} // Use post.images
                    loading="lazy"
                    style={{
                      cursor: "pointer", // Use post.images
                      display: "block",
                      width: "100%",
                      height: "auto",
                    }}
                  />
                  {images.length > MAX_GRID_IMAGES && // Use post.images
                    index === MAX_GRID_IMAGES - 1 && (
                      <Box
                        sx={{
                          position: "absolute", // Use post.images
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "white",
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        +{images.length - MAX_GRID_IMAGES} {/* Use post.images */}
                      </Box>
                    )}
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <CardMedia
              component="img"
              image={images[0].url} // Use post.images
              alt="Post image"
              sx={{ maxHeight: 500, objectFit: "contain", cursor: "pointer" }}
            />
          )}
        </Box>
      )}

      <CardActions disableSpacing sx={{ pt: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex" }}>
            {/* Like Button */}
            <IconButton
              onClick={handleLike}
              color={post.liked ? "primary" : "default"} // Use post.liked
              aria-label="add to favorites"
            >
              {post.liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography sx={{ alignSelf: "center", mr: 2 }}>
              {post.likesCount} {/* Use post.likesCount */}
            </Typography>
            {/* Comment Button */}
            <IconButton
              aria-label="comment"
              onClick={handleToggleComments}
            >
              <Chat />
            </IconButton>
            <Typography
              sx={{ alignSelf: "center", mr: 2, cursor: 'pointer' }}
              onClick={handleToggleComments}
            >
              {postCommentData ? postCommentData.totalCount : post.commentsCount} {/* Use post.commentsCount */}
            </Typography>
             {/* Repost Button */}
             <IconButton
              onClick={handleOpenRepostModal} // Use the new handler
              // disabled={isReposting} // Disable based on modal's state if needed, or remove
              aria-label="repost"
            >
              <RepeatIcon /> {/* Use RepeatIcon */}
            </IconButton>
             {/* Share Button (Optional) */}
            {/* <IconButton aria-label="share">
              <Share />
            </IconButton> */}
          </Box>
          {/* Save Button */}
          <IconButton
            onClick={() => onSave(post.id)} // Use post.id
            color={post.saved ? "primary" : "default"} // Use post.saved
            aria-label="bookmark"
          >
            {post.saved ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>
      </CardActions>

       {/* Comment Section */}
       {showComments && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, pb: 2 }}>
             {/* New Comment Input */}
             <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
               <TextField
                 fullWidth
                 variant="outlined"
                 size="small"
                 placeholder="Viết bình luận..."
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 onKeyPress={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleAddComment();
                   }
                 }}
               />
               <Button
                 variant="contained"
                 size="small"
                 onClick={handleAddComment}
                 disabled={!newComment.trim()}
               >
                 Gửi
               </Button>
             </Box>

             {/* Comment List or Loading Indicator */}
             {isLoadingCurrentComments ? (
               <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                 <CircularProgress size={24} />
               </Box>
             ) : (
               <Box sx={{ maxHeight: 300, overflowY: 'auto' }}> {/* Scrollable comment list */}
                 {comments.length > 0 ? (
                   comments.map((comment) => (
                     <CommentItem key={comment.id} comment={comment} postId={post.id} /> // Use post.id
                   ))
                 ) : (
                   <Typography variant="body2" color="text.secondary">
                     Chưa có bình luận nào.
                   </Typography>
                 )}
               </Box>
             )}
           </Box>
         </>
       )}

       {/* Render Repost Modal */}
       {isRepostModalOpen && (
         <RepostModal
           open={isRepostModalOpen}
           onClose={() => setIsRepostModalOpen(false)}
           post={post} // Pass the full post object
           onConfirmRepost={handleRepost} // Pass the handler correctly
         />
       )}

       {/* Delete Confirmation Dialog */}
       <Dialog
         open={deleteConfirmOpen}
         onClose={handleCancelDelete}
       >
         <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
         <DialogContent>
           <DialogContentText>
             Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.
           </DialogContentText>
         </DialogContent>
         <DialogActions>
           <Button onClick={handleCancelDelete} color="primary">
             Hủy
           </Button>
           <Button 
             onClick={handleDeletePost}
             color="error"
             disabled={isDeleting}
           >
             {isDeleting ? 'Đang xóa...' : 'Xóa'}
           </Button>
         </DialogActions>
       </Dialog>
     </Card>
   );
 };

 export default Post;
