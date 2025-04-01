import React, { useState } from "react"; // Import useState
import {
  Avatar,
  Box,
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
} from "@mui/material";
import {
  Bookmark,
  BookmarkBorder,
  Chat,
  Favorite,
  FavoriteBorder,
  Share,
} from "@mui/icons-material";
import type { User } from "../../../types/user";
import type { Image as ImageType } from "../../../types/image";
import { usePostStore } from "../../../stores/postStore"; // Import post store
import CommentItem from "./CommentItem"; // Import CommentItem

interface PostProps {
  id: number;
  user: User;
  content: string;
  images?: ImageType[];
  timestamp: string;
  likes: number;
  comments: number; // Keep this prop for initial count display
  liked: boolean;
  saved: boolean;
  onLike: (id: number) => void;
  onSave: (id: number) => void;
  className?: string;
  sx?: SxProps<Theme>;
}

const MAX_GRID_IMAGES = 4;

const Post: React.FC<PostProps> = ({
  id,
  user,
  content,
  images,
  timestamp,
  likes,
  comments: initialCommentCount, // Rename prop to avoid conflict
  liked,
  saved,
  onLike,
  onSave,
  className,
  sx,
}) => {
  const displayImages = images && images.length > 0;
  const isGridDisplay = displayImages && images.length > 1;
  const numColumns = images ? Math.min(images.length, 3) : 1;

  // Comment State & Store Integration
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Optimized state selection from Zustand store
  const postComments = usePostStore((state) => state.commentsByPostId[id]); // Select comments for this specific post
  const isLoadingPostComments = usePostStore((state) => state.isLoadingComments[id]); // Select loading state for this specific post
  const fetchComments = usePostStore((state) => state.fetchComments); // Select action
  const addComment = usePostStore((state) => state.addComment); // Select action


  const handleToggleComments = () => {
    const nextShowComments = !showComments;
    setShowComments(nextShowComments);
    // Fetch comments only when expanding and if they haven't been fetched yet and aren't currently loading
    if (
      nextShowComments &&
      !postComments && // Use the selected state
      !isLoadingPostComments // Use the selected state
    ) {
      fetchComments(id);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      // AddComment action already handles parentId=null for top-level comments
      await addComment(id, newComment.trim());
      setNewComment(""); // Clear input after sending
    }
  };

  const comments = postComments || []; // Use the selected state
  const isLoadingCurrentComments = isLoadingPostComments ?? false; // Use the selected state, default to false

  return (
    <Card className={className} sx={sx}>
      <CardHeader
        avatar={<Avatar src={user.avatar} alt={user.name} />}
        title={user.name}
        subheader={timestamp}
        sx={{
          textAlign: "left",
          "& .MuiCardHeader-content": {
            textAlign: "left",
          },
          "& .MuiCardHeader-subheader": {
            fontSize: "0.8em",
            fontWeight: 500,
          },
        }}
      />
      <CardContent>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography>
      </CardContent>

      {displayImages && (
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
                    alt={`Post image ${index + 1}`}
                    loading="lazy"
                    style={{
                      cursor: "pointer",
                      display: "block",
                      width: "100%",
                      height: "auto",
                    }}
                  />
                  {images.length > MAX_GRID_IMAGES &&
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
                        +{images.length - MAX_GRID_IMAGES}
                      </Box>
                    )}
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <CardMedia
              component="img"
              image={images[0].url}
              alt="Post image"
              sx={{ maxHeight: 500, objectFit: "contain", cursor: "pointer" }}
            />
          )}
        </Box>
      )}

      <CardActions disableSpacing>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <IconButton
              onClick={() => onLike(id)}
              color={liked ? "primary" : "default"}
              aria-label="add to favorites"
            >
              {liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography sx={{ alignSelf: "center", mr: 2 }}>
              {likes} {/* Assuming likes is now just a number */}
            </Typography>
            {/* Comment Icon */}
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
              {/* Display live comment count if available, otherwise initial */}
              {postComments ? comments.length : initialCommentCount} {/* Use postComments here */}
            </Typography>
            <IconButton aria-label="share">
              <Share />
            </IconButton>
          </Box>
          <IconButton
            onClick={() => onSave(id)}
            color={saved ? "primary" : "default"}
            aria-label="bookmark"
          >
            {saved ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>
      </CardActions>

      {/* Comment Section */}
      {showComments && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ p: 2 }}>
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
                    // Pass the postId to CommentItem
                    <CommentItem key={comment.id} comment={comment} postId={id} />
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
    </Card>
  );
};

export default Post;
