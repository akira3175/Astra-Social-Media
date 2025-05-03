import {
  PeopleAlt,
  Comment as CommentIcon,
  Article,
  TrendingUp,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import {
  Report,
} from "../../../types/management";
import { Comment } from "../../../types/comment";
import { Post } from "../../../types/post";
import { User } from "../../../types/user";


export const TopGeneralOverview = ({
  users,
  posts,
  isLoading,
  comments,
  reports,
}: {
  users: User[];
  posts: Post[];
  isLoading: boolean;
  comments: Comment[];
  reports: User[];
}) => {
  const isWithinPastRange = (
    date: string | Date | number,
    startDays: number,
    endDays: number
  ): boolean => {
    const targetDate =
      typeof date === "number"
        ? new Date(date.toString().length === 10 ? date * 1000 : date) // Handle seconds or milliseconds
        : new Date(date);

    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    startDate.setDate(now.getDate() - startDays); // Start of the range
    endDate.setDate(now.getDate() - endDays); // End of the range

    return targetDate >= endDate && targetDate < startDate;
  };
  const userBetween60And30Days = users.filter((user) =>
    isWithinPastRange(user.dateJoined || "", 60, 30)
  );

  const postBetween60And30Days = posts.filter((post) =>
    isWithinPastRange(post.createdAt || "", 60, 30)
  );

  const commentBetween60And30Days = comments.filter((comment) =>
    isWithinPastRange(comment.createdAt || "", 60, 30)
  );
  const calculatePercentageIncrease = (
    current: number,
    previous: number
  ): string => {
    if (previous === 0) {
      return "Không có dữ liệu tháng trước"; // Handle division by zero
    }
    const increase = ((current - previous) / previous) * 100;
    return `Tăng ${increase.toFixed(2)}% so với tháng trước`;
  };
  const isWithinPastDays = (
    date: string | Date | number,
    days: number
  ): boolean => {
    const targetDate =
      typeof date === "number"
        ? new Date(date.toString().length === 10 ? date * 1000 : date) // Handle seconds or milliseconds
        : new Date(date);

    const now = new Date();
    const diffTime = Math.abs(now.getTime() - targetDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  };
  const userPast30Days = users.filter((user) =>
    isWithinPastDays(user.dateJoined || "", 30)
  );

  const postPast30Days = posts.filter((post) =>
    isWithinPastDays(post.createdAt || "", 30)
  );

  const commentPast30Days = comments.filter((comment) =>
    isWithinPastDays(comment.createdAt || "", 30)
  );
  const STATS = [
    {
      title: "Tổng người dùng",
      value: isLoading ? "..." : users.length,
      icon: <PeopleAlt />,
      thisMonth: userPast30Days.length,
      lastMonth: userBetween60And30Days.length,
      color: "#4f46e5",
    },
    {
      title: "Tổng bài viết",
      value: isLoading ? "..." : posts.length,
      icon: <Article />,
      thisMonth: postPast30Days.length,
      lastMonth: postBetween60And30Days.length,
      color: "#0891b2",
    },
    {
      title: "Tổng bình luận",
      value: isLoading ? "..." : comments.length,
      icon: <CommentIcon />,
      thisMonth: commentPast30Days.length,
      lastMonth: commentBetween60And30Days.length,
      color: "#16a34a",
    },
    {
      title: "Lượt truy cập",
      value: isLoading ? "..." : reports.length,
      icon: <TrendingUp />,

      color: "#ea580c",
    },
  ];
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {STATS.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="div">
                  {stat.title}
                </Typography>
                <Avatar
                  sx={{
                    bgcolor: stat.color,
                    width: 40,
                    height: 40,
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
              <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                {stat.value}
              </Typography>
              {typeof stat.thisMonth != "undefined" &&
                typeof stat.lastMonth != "undefined" && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {calculatePercentageIncrease(
                      stat.thisMonth,
                      stat.lastMonth
                    )}
                  </Typography>
                )}
                 {typeof stat.lastMonth == "undefined" && typeof stat.thisMonth == "undefined" && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Lượt truy cập ngày hôm nay
                </Typography>
              )}
             
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
