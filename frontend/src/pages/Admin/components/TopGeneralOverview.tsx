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


export const TopGeneralOverview = ({users,posts,isLoading,comments,reports}:{users:User[], posts:Post[], isLoading:boolean, comments:Comment[], reports:Report[]}) => {
  
    
  // Dữ liệu mẫu
  const STATS = [
    {
      title: "Tổng người dùng",
      value: isLoading ? "..." : users.length,
      icon: <PeopleAlt />,
      color: "#4f46e5",
    },
    {
      title: "Tổng bài viết",
      value: isLoading ? "..." : posts.length,
      icon: <Article />,
      color: "#0891b2",
    },
    {
      title: "Tổng bình luận",
      value: isLoading ? "..." : comments.length,
      icon: <CommentIcon />,
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
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tăng 12% so với tháng trước
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
