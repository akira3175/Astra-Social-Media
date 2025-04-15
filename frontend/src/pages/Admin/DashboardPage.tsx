import type React from "react"
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  LinearProgress,
  Paper,
} from "@mui/material"
import { PeopleAlt, Article, Comment, TrendingUp, Person, Visibility, ThumbUp, AccessTime } from "@mui/icons-material"
import AdminLayout from "./components/AdminLayout"
import { getComments, getPosts, getReports, getUsers } from "../../services/adminService"
const users = await getUsers()
const posts = await getPosts()
const comments = await getComments()
const reports  = await getReports()
// Dữ liệu mẫu
const STATS = [
  { title: "Tổng người dùng", value: users.length, icon: <PeopleAlt />, color: "#4f46e5" },
  { title: "Tổng bài viết", value: posts.length, icon: <Article />, color: "#0891b2" },
  { title: "Tổng bình luận", value: comments.length, icon: <Comment />, color: "#16a34a" },
  { title: "Lượt truy cập", value: reports.length, icon: <TrendingUp />, color: "#ea580c" },
]

const RECENT_USERS = [
  { id: 1, name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?img=1", date: "2 giờ trước" },
  { id: 2, name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?img=5", date: "5 giờ trước" },
  { id: 3, name: "Lê Văn C", avatar: "https://i.pravatar.cc/150?img=8", date: "1 ngày trước" },
  { id: 4, name: "Phạm Thị D", avatar: "https://i.pravatar.cc/150?img=10", date: "2 ngày trước" },
]

const RECENT_POSTS = [
  {
    id: 1,
    title: "Hướng dẫn sử dụng React Hooks",
    author: "Nguyễn Văn A",
    date: "2 giờ trước",
    views: 120,
    likes: 45,
  },
  {
    id: 2,
    title: "10 xu hướng thiết kế UI/UX năm 2023",
    author: "Trần Thị B",
    date: "5 giờ trước",
    views: 85,
    likes: 32,
  },
  {
    id: 3,
    title: "Tối ưu hóa hiệu suất ứng dụng React",
    author: "Lê Văn C",
    date: "1 ngày trước",
    views: 65,
    likes: 28,
  },
]

const ACTIVITY_STATS = [
  { label: "Người dùng mới", value: 85, total: 100, color: "#4f46e5" },
  { label: "Bài viết mới", value: 62, total: 100, color: "#0891b2" },
  { label: "Bình luận mới", value: 78, total: 100, color: "#16a34a" },
  { label: "Báo cáo", value: 24, total: 100, color: "#dc2626" },
]

const DashboardPage: React.FC = () => {
  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tổng quan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Xem tổng quan về hoạt động của hệ thống
        </Typography>
      </Box>

      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STATS.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
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

      {/* Hoạt động gần đây */}
      <Grid container spacing={3}>
        {/* Người dùng mới */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Person sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Người dùng mới</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {RECENT_USERS.map((user) => (
                  <ListItem key={user.id} disablePadding sx={{ mb: 2 }}>
                    <ListItemAvatar>
                      <Avatar src={user.avatar} alt={user.name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.date}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Bài viết mới */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Article sx={{ mr: 1, color: "info.main" }} />
                <Typography variant="h6">Bài viết mới</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List disablePadding>
                {RECENT_POSTS.map((post) => (
                  <ListItem key={post.id} disablePadding sx={{ mb: 2 }}>
                    <ListItemText
                      primary={post.title}
                      secondary={
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Person fontSize="small" sx={{ fontSize: "0.9rem", mr: 0.5, color: "text.secondary" }} />
                            <Typography variant="caption">{post.author}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccessTime
                              fontSize="small"
                              sx={{ fontSize: "0.9rem", mr: 0.5, color: "text.secondary" }}
                            />
                            <Typography variant="caption">{post.date}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Visibility
                              fontSize="small"
                              sx={{ fontSize: "0.9rem", mr: 0.5, color: "text.secondary" }}
                            />
                            <Typography variant="caption">{post.views}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ThumbUp fontSize="small" sx={{ fontSize: "0.9rem", mr: 0.5, color: "text.secondary" }} />
                            <Typography variant="caption">{post.likes}</Typography>
                          </Box>
                        </Box>
                      }
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Hoạt động trong tuần */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUp sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h6">Hoạt động trong tuần</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {ACTIVITY_STATS.map((activity, index) => (
                  <Box key={index}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">{activity.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {activity.value}%
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Thống kê chi tiết */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê chi tiết
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Đây là trang tổng quan quản trị. Bạn có thể xem thêm thông tin chi tiết bằng cách truy cập các trang quản
              lý cụ thể từ menu bên trái.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  )
}

export default DashboardPage
