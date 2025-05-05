import type React from "react";
import { Box, Grid, Typography, Paper } from "@mui/material";
import AdminLayout from "./components/AdminLayout";
import { TopGeneralOverview } from "./components/TopGeneralOverview";
import { useState, useEffect } from "react";
import {
  getUsers,
  getPosts,
  getAllUserLoginToday,
  getComments
} from "../../services/adminService";
import NewUserOveriew from "./components/NewUserOveriew";
import NewPostOverview from "./components/NewPostOverview";
import WeeklyOverview from "./components/WeeklyOverview";
import { User } from "../../types/user";
import { Post } from "../../types/post";
import { FlattenedComment } from "../../services/adminService";

const DashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<FlattenedComment[]>([]);
  const [reports, setReports] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await getUsers();
        const postsData = await getPosts();
        const commentsData = await getComments();
        const latestLogins = await getAllUserLoginToday();
        setUsers(usersData);
        setPosts(postsData);
        setComments(commentsData);
        setReports(latestLogins);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <TopGeneralOverview
        comments={comments}
        isLoading={isLoading}
        users={users}
        posts={posts}
        reports={reports}
      />

      {/* Hoạt động gần đây */}
      <Grid container spacing={3}>
        {/* Người dùng mới */}
        <NewUserOveriew users={users} isLoading={isLoading} />
        {/* Bài viết mới */}
        <NewPostOverview posts={posts} isLoading={isLoading} />
        {/* Hoạt động trong tuần */}
        <WeeklyOverview
          users={users}
          isLoading={isLoading}
          posts={posts}
          comments={comments}
        />
      </Grid>

      {/* Thống kê chi tiết */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thống kê chi tiết
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Đây là trang tổng quan quản trị. Bạn có thể xem thêm thông tin chi
              tiết bằng cách truy cập các trang quản lý cụ thể từ menu bên trái.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </AdminLayout>
  );
};

export default DashboardPage;
