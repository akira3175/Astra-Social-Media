import type React from "react"
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  type SxProps,
  type Theme,
  Typography,
} from "@mui/material"
import { Bookmark, BookmarkBorder, Chat, Favorite, FavoriteBorder, Share } from "@mui/icons-material"
import type { User } from "../../../types/user"

interface PostProps {
  id: number
  user: User
  content: string
  image?: string
  timestamp: string
  likes: number
  comments: number
  liked: boolean
  saved: boolean
  onLike: (id: number) => void
  onSave: (id: number) => void
  className?: string
  sx?: SxProps<Theme>
}

const Post: React.FC<PostProps> = ({
  id,
  user,
  content,
  image,
  timestamp,
  likes,
  comments,
  liked,
  saved,
  onLike,
  onSave,
  className,
  sx,
}) => {
  return (
    <Card className={className} sx={sx}>
      <CardHeader avatar={<Avatar src={user.avatar} alt={user.name} />} title={user.name} subheader={timestamp} />
      <CardContent>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {content}
        </Typography>
      </CardContent>
      {image && (
        <CardMedia component="img" image={image} alt="Post image" sx={{ maxHeight: 500, objectFit: "contain" }} />
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
            <IconButton onClick={() => onLike(id)} color={liked ? "primary" : "default"} aria-label="add to favorites">
              {liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography sx={{ alignSelf: "center", mr: 2 }}>{likes}</Typography>
            <IconButton aria-label="comment">
              <Chat />
            </IconButton>
            <Typography sx={{ alignSelf: "center", mr: 2 }}>{comments}</Typography>
            <IconButton aria-label="share">
              <Share />
            </IconButton>
          </Box>
          <IconButton onClick={() => onSave(id)} color={saved ? "primary" : "default"} aria-label="bookmark">
            {saved ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  )
}

export default Post

