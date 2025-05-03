import { TrendingUp } from "@mui/icons-material";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  LinearProgress,
} from "@mui/material";
import { Comment } from "../../../types/comment";
import { Post } from "../../../types/post";
import { Report } from "../../../types/management";
import { User } from "../../../types/user";

const WeeklyOverview = ({
  users,
  isLoading,
  posts,
  comments,
}: {
  users: User[];
  isLoading: boolean;
  posts: Post[];
  comments: Comment[];
}) => {
  // Helper function to check if a date is within the past week
  const isWithinPastWeek = (date: string | Date): boolean => {
    const targetDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - targetDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  // Use the helper function for filtering
  const userPastWeek = users.filter((user) =>
    isWithinPastWeek(new Date(user.dateJoined || ""))
  );
  const postPastWeek = posts.filter((post) => isWithinPastWeek(new Date(post.createdAt)));
  const commentPastWeek = comments.filter((comment) =>
    isWithinPastWeek(new Date(comment.createdAt))
  );
  const ACTIVITY_STATS = [
    {
      label: "Người dùng mới",
      value: userPastWeek.length,
      total: users.length,
      color: "#4f46e5",
    },
    {
      label: "Bài viết mới",
      value: postPastWeek.length,
      total: posts.length,
      color: "#0891b2",
    },
    {
      label: "Bình luận mới",
      value: commentPastWeek.length,
      total: comments.length,
      color: "#16a34a",
    },
  ];
  return (
    <Grid item xs={12} lg={4}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TrendingUp sx={{ mr: 1, color: "success.main" }} />
            <Typography variant="h6">Hoạt động trong tuần</Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {isLoading && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body2">Đang tải...</Typography>
            </Box>
          )}
          {!isLoading && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {ACTIVITY_STATS.map((activity, index) => (
                <Box key={index}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">{activity.label}</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {activity.value}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(activity.value / activity.total) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: "background.default",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: activity.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default WeeklyOverview;
