import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ChevronLeft as ChevronLeftIcon,
  Article as ArticleIcon,
  Comment as CommentIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getAdminStats,
  getPosts,
  getLockedPosts,
  lockPost,
  unlockPost,
  getComments,
  getLockedComments,
  lockComment,
  unlockComment,
  getUsers,
  getBannedUsers,
  banUser,
  unbanUser,
  getReports,
  resolveReport,
  Post,
  Comment,
  User,
  Report,
  AdminStats,
} from '../../services/adminService';

const drawerWidth = 240;

const AdminDashboard = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalPosts: 0,
    lockedPosts: 0,
    totalComments: 0,
    lockedComments: 0,
    totalUsers: 0,
    bannedUsers: 0,
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [lockedPosts, setLockedPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [lockedComments, setLockedComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError('Không thể tải thống kê. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      setError('Không thể tải danh sách bài đăng. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLockedPosts = async () => {
    try {
      setLoading(true);
      const data = await getLockedPosts();
      setLockedPosts(data);
    } catch (err) {
      setError('Không thể tải danh sách bài đăng bị khóa. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getComments();
      setComments(data);
    } catch (err) {
      setError('Không thể tải danh sách comment. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLockedComments = async () => {
    try {
      setLoading(true); 
      const data = await getLockedComments();
      setLockedComments(data);
    } catch (err) {
      setError('Không thể tải danh sách comment bị khóa. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Không thể tải danh sách user. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannedUsers = async () => {
    try {
      setLoading(true);
      const data = await getBannedUsers();
      setBannedUsers(data);
    } catch (err) {
      setError('Không thể tải danh sách user bị cấm. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setError('Không thể tải danh sách báo cáo. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleFunctionClick = async (functionName: string) => {
    setSelectedFunction(functionName);
    setDialogOpen(true);
    
    // Fetch data based on selected function
    switch (functionName) {
      case 'posts':
        await fetchPosts();
        break;
      case 'locked-posts':
        await fetchLockedPosts();
        break;
      case 'comments':
        await fetchComments();
        break;
      case 'locked-comments':
        await fetchLockedComments();
        break;
      case 'users':
        await fetchUsers();
        break;
      case 'banned-users':
        await fetchBannedUsers();
        break;
      case 'reports':
        await fetchReports();
        break;
      default:
        break;
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedFunction(null);
    setSelectedItem(null);
  };

  const handleAction = async (action: string) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'lock':
          if (selectedFunction === 'posts') {
            await lockPost(selectedItem.id);
            setSuccess(`Đã khóa bài đăng "${selectedItem.title}"`);
            await fetchPosts();
            await fetchStats();
          } else if (selectedFunction === 'comments') {
            await lockComment(selectedItem.id);
            setSuccess(`Đã khóa comment của "${selectedItem.author}"`);
            await fetchComments();
            await fetchStats();
          }
          break;
        case 'unlock':
          if (selectedFunction === 'posts' || selectedFunction === 'locked-posts') {
            await unlockPost(selectedItem.id);
            setSuccess(`Đã mở khóa bài đăng "${selectedItem.title}"`);
            await fetchLockedPosts();
            await fetchStats();
          } else if (selectedFunction === 'comments' || selectedFunction === 'locked-comments') {
            await unlockComment(selectedItem.id);
            setSuccess(`Đã mở khóa comment của "${selectedItem.author}"`);
            await fetchLockedComments();
            await fetchStats();
          }
          break;
        case 'ban':
          await banUser(selectedItem.id);
          setSuccess(`Đã cấm user "${selectedItem.firstName} ${selectedItem.lastName}"`);
          await fetchUsers();
          await fetchStats();
          break;
        case 'unban':
          await unbanUser(selectedItem.id);
          setSuccess(`Đã bỏ cấm user "${selectedItem.firstName} ${selectedItem.lastName}"`);
          await fetchBannedUsers();
          await fetchStats();
          break;
        case 'resolve':
          await resolveReport(selectedItem.id);
          setSuccess(`Đã xử lý báo cáo #${selectedItem.id}`);
          await fetchReports();
          break;
        default:
          break;
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
      handleDialogClose();
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Quản lý bài đăng', icon: <ArticleIcon />, path: '/admin/posts' },
    { text: 'Quản lý comment', icon: <CommentIcon />, path: '/admin/comments' },
    { text: 'Quản lý user', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Báo cáo', icon: <WarningIcon />, path: '/admin/reports' },
  ];

  const statsCards = [
    { 
      title: 'Tổng số bài đăng', 
      value: stats.totalPosts.toString(), 
      color: '#4f46e5',
      function: 'posts',
      icon: <ArticleIcon sx={{ fontSize: 40, color: '#4f46e5' }} />
    },
    { 
      title: 'Bài đăng bị khóa', 
      value: stats.lockedPosts.toString(), 
      color: '#ef4444',
      function: 'locked-posts',
      icon: <ArticleIcon sx={{ fontSize: 40, color: '#ef4444' }} />
    },
    { 
      title: 'Tổng số comment', 
      value: stats.totalComments.toString(), 
      color: '#10b981',
      function: 'comments',
      icon: <CommentIcon sx={{ fontSize: 40, color: '#10b981' }} />
    },
    { 
      title: 'Comment bị khóa', 
      value: stats.lockedComments.toString(), 
      color: '#f59e0b',
      function: 'locked-comments',
      icon: <CommentIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
    },
    { 
      title: 'Tổng số user', 
      value: stats.totalUsers.toString(), 
      color: '#8b5cf6',
      function: 'users',
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#8b5cf6' }} />
    },
    { 
      title: 'User bị cấm', 
      value: stats.bannedUsers.toString(), 
      color: '#dc2626',
      function: 'banned-users',
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#dc2626' }} />
    },
  ];

  const renderDialogContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (selectedFunction) {
      case 'posts':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Tác giả</TableCell>
                  <TableCell>Ngày đăng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Không có bài đăng nào</TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.id}</TableCell>
                      <TableCell>{post.title}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={post.status === 'active' ? 'Hoạt động' : 'Đã khóa'} 
                          color={post.status === 'active' ? 'success' : 'error'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color={post.status === 'active' ? 'error' : 'success'}
                          onClick={() => {
                            setSelectedItem(post);
                            handleAction(post.status === 'active' ? 'lock' : 'unlock');
                          }}
                        >
                          {post.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'locked-posts':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Tác giả</TableCell>
                  <TableCell>Ngày đăng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lockedPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Không có bài đăng nào bị khóa</TableCell>
                  </TableRow>
                ) : (
                  lockedPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>{post.id}</TableCell>
                      <TableCell>{post.title}</TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>{post.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Đã khóa" 
                          color="error" 
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => {
                            setSelectedItem(post);
                            handleAction('unlock');
                          }}
                        >
                          Mở khóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'comments':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Bài đăng</TableCell>
                  <TableCell>Tác giả</TableCell>
                  <TableCell>Ngày đăng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có comment nào</TableCell>
                  </TableRow>
                ) : (
                  comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>{comment.id}</TableCell>
                      <TableCell>{comment.content}</TableCell>
                      <TableCell>{comment.post}</TableCell>
                      <TableCell>{comment.author}</TableCell>
                      <TableCell>{comment.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={comment.status === 'active' ? 'Hoạt động' : 'Đã khóa'} 
                          color={comment.status === 'active' ? 'success' : 'error'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color={comment.status === 'active' ? 'error' : 'success'}
                          onClick={() => {
                            setSelectedItem(comment);
                            handleAction(comment.status === 'active' ? 'lock' : 'unlock');
                          }}
                        >
                          {comment.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'locked-comments':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Bài đăng</TableCell>
                  <TableCell>Tác giả</TableCell>
                  <TableCell>Ngày đăng</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lockedComments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có comment nào bị khóa</TableCell>
                  </TableRow>
                ) : (
                  lockedComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>{comment.id}</TableCell>
                      <TableCell>{comment.content}</TableCell>
                      <TableCell>{comment.post}</TableCell>
                      <TableCell>{comment.author}</TableCell>
                      <TableCell>{comment.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label="Đã khóa" 
                          color="error" 
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => {
                            setSelectedItem(comment);
                            handleAction('unlock');
                          }}
                        >
                          Mở khóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'users':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Đăng nhập cuối</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">Không có user nào</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Avatar 
                          src={user.avatar} 
                          alt={`${user.firstName} ${user.lastName}`}
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>
                        {user.isSuperUser ? 'Admin' : user.isStaff ? 'Nhân viên' : 'Người dùng'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.isActive ? 'Hoạt động' : 'Đã cấm'} 
                          color={user.isActive ? 'success' : 'error'} 
                        />
                      </TableCell>
                      <TableCell>{user.dateJoined}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color={user.isActive ? 'error' : 'success'}
                          onClick={() => {
                            setSelectedItem(user);
                            handleAction(user.isActive ? 'ban' : 'unban');
                          }}
                        >
                          {user.isActive ? 'Cấm' : 'Bỏ cấm'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'banned-users':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Tên</TableCell>
                  <TableCell>Vai trò</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tham gia</TableCell>
                  <TableCell>Đăng nhập cuối</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bannedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">Không có user nào bị cấm</TableCell>
                  </TableRow>
                ) : (
                  bannedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Avatar 
                          src={user.avatar} 
                          alt={`${user.firstName} ${user.lastName}`}
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                      <TableCell>
                        {user.isSuperUser ? 'Admin' : user.isStaff ? 'Nhân viên' : 'Người dùng'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="Đã cấm" 
                          color="error" 
                        />
                      </TableCell>
                      <TableCell>{user.dateJoined}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => {
                            setSelectedItem(user);
                            handleAction('unban');
                          }}
                        >
                          Bỏ cấm
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 'reports':
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Người báo cáo</TableCell>
                  <TableCell>Ngày báo cáo</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">Không có báo cáo nào</TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>{report.content}</TableCell>
                      <TableCell>{report.reporter}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={report.status === 'pending' ? 'Chờ xử lý' : 'Đã xử lý'} 
                          color={report.status === 'pending' ? 'warning' : 'success'} 
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            setSelectedItem(report);
                            handleAction('resolve');
                          }}
                          disabled={report.status === 'resolved'}
                        >
                          {report.status === 'pending' ? 'Xử lý' : 'Đã xử lý'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          ml: open ? `${drawerWidth}px` : 0,
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat) => (
            <Grid item xs={12} sm={6} md={4} key={stat.title}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleFunctionClick(stat.function)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {stat.icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Typography variant="h4" component="div" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Dialog for showing detailed information */}
        <Dialog
          open={dialogOpen}
          onClose={handleDialogClose}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            {selectedFunction === 'posts' && 'Quản lý bài đăng'}
            {selectedFunction === 'locked-posts' && 'Bài đăng bị khóa'}
            {selectedFunction === 'comments' && 'Quản lý comment'}
            {selectedFunction === 'locked-comments' && 'Comment bị khóa'}
            {selectedFunction === 'users' && 'Quản lý user'}
            {selectedFunction === 'banned-users' && 'User bị cấm'}
            {selectedFunction === 'reports' && 'Quản lý báo cáo'}
          </DialogTitle>
          <DialogContent>
            {renderDialogContent()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={!!error || !!success} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {error ? (
            <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
              {error}
            </Alert>
          ) : (
            <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
              {success}
            </Alert>
          )}
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 