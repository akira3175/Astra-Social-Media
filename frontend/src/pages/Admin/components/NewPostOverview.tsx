import { Article, Person, AccessTime, ThumbUp } from "@mui/icons-material";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Post } from "../../../types/post";

const NewPostOverview = ({
  posts,
  isLoading,
}: {
  posts: Post[];
  isLoading: boolean;
}) => {
  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Article sx={{ mr: 1, color: "info.main" }} />
            <Typography variant="h6">Bài viết mới</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2">Đang tải...</Typography>
            </Box>
          )}
          {!isLoading&&(<List disablePadding>
            {posts.length === 0 && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body2">Không có bài viết nào {":("}</Typography>
              </Box>
            )}
            {posts.length >0 && posts.map((post) => (
              <ListItem key={post.id} disablePadding sx={{ mb: 2 }}>
                <ListItemText
                  primary={post.content}
                  primary={post.content}
                  secondary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1,
                        mt: 0.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person
                          fontSize="small"
                          sx={{
                            fontSize: "0.9rem",
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption">{post.user.firstName} {post.user.lastName}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTime
                          fontSize="small"
                          sx={{
                            fontSize: "0.9rem",
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption">{new Date(post.createdAt).toLocaleString()}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ThumbUp
                          fontSize="small"
                          sx={{
                            fontSize: "0.9rem",
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="caption">
                          {post.likeCount}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>)}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default NewPostOverview;
