import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom"
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
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
  Collapse,
} from "@mui/material"
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Article,
  Comment,
  Settings,
  Logout,
  ChevronLeft,
  AccountCircle,
  Notifications,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material"

const drawerWidth = 240

interface AdminLayoutProps {
  children?: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [notificationEl, setNotificationEl] = useState<null | HTMLElement>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [contentOpen, setContentOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"))

  // Kiểm tra xác thực khi component được mount
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      navigate("/admin/login")
    } else {
      setIsAuthenticated(true)
    }

    // Đóng drawer trên mobile và màn hình nhỏ
    if (isMobile || isSmallScreen) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [navigate, isMobile, isSmallScreen])

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationClose = () => {
    setNotificationEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    navigate("/admin/login")
  }

  const handleContentToggle = () => {
    setContentOpen(!contentOpen)
  }

  // Danh sách menu
  // const menuItems = [
  //   { text: "Tổng quan", icon: <Dashboard />, path: "/admin/dashboard" },
  //   { text: "Quản lý người dùng", icon: <People />, path: "/admin/users" },
  //   { text: "Quản lý bài viết", icon: <Article />, path: "/admin/posts" },
  //   { text: "Quản lý bình luận", icon: <Comment />, path: "/admin/comments" },
  //   { text: "Cài đặt hệ thống", icon: <Settings />, path: "/admin/settings" },
  // ]

  if (!isAuthenticated) {
    return null // Không hiển thị gì nếu chưa xác thực
  }

  const drawer = (
    <>
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: [1],
        }}
      >
        <Typography
          variant="h6"
          component={RouterLink}
          to="/admin/dashboard"
          sx={{ color: "primary.main", textDecoration: "none", fontWeight: "bold" }}
        >
          SocialConnect
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 1 }}>
        <List>
          {/* Dashboard */}
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/admin/dashboard"
              selected={location.pathname === "/admin/dashboard"}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.lighter",
                  "&:hover": {
                    bgcolor: "primary.lighter",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === "/admin/dashboard" ? "primary.main" : "inherit",
                  minWidth: 40,
                }}
              >
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="Tổng quan" />
            </ListItemButton>
          </ListItem>

          {/* Quản lý nội dung */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleContentToggle}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor:
                  location.pathname.includes("/admin/users") ||
                  location.pathname.includes("/admin/posts") ||
                  location.pathname.includes("/admin/comments")
                    ? "primary.lighter"
                    : "transparent",
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Article />
              </ListItemIcon>
              <ListItemText primary="Quản lý nội dung" />
              {contentOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={contentOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/admin/users"
                selected={location.pathname === "/admin/users"}
                sx={{
                  pl: 4,
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.lighter",
                    "&:hover": {
                      bgcolor: "primary.lighter",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === "/admin/users" ? "primary.main" : "inherit",
                    minWidth: 40,
                  }}
                >
                  <People />
                </ListItemIcon>
                <ListItemText primary="Người dùng" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/admin/posts"
                selected={location.pathname === "/admin/posts"}
                sx={{
                  pl: 4,
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.lighter",
                    "&:hover": {
                      bgcolor: "primary.lighter",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === "/admin/posts" ? "primary.main" : "inherit",
                    minWidth: 40,
                  }}
                >
                  <Article />
                </ListItemIcon>
                <ListItemText primary="Bài viết" />
              </ListItemButton>

              <ListItemButton
                component={RouterLink}
                to="/admin/comments"
                selected={location.pathname === "/admin/comments"}
                sx={{
                  pl: 4,
                  borderRadius: 1,
                  mb: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.lighter",
                    "&:hover": {
                      bgcolor: "primary.lighter",
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === "/admin/comments" ? "primary.main" : "inherit",
                    minWidth: 40,
                  }}
                >
                  <Comment />
                </ListItemIcon>
                <ListItemText primary="Bình luận" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Cài đặt */}
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/admin/settings"
              selected={location.pathname === "/admin/settings"}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "primary.lighter",
                  "&:hover": {
                    bgcolor: "primary.lighter",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === "/admin/settings" ? "primary.main" : "inherit",
                  minWidth: 40,
                }}
              >
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Cài đặt" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
      <List sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  )

  return (
    <Box sx={{ display: "flex", height: "90vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: "background.paper", // Change to white background
          color: "primary.main", // Change text to primary color
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && !isMobile && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Quản trị hệ thống
          </Typography>

          {/* Notifications */}
          <Tooltip title="Thông báo">
            <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User menu */}
          <Tooltip title="Tài khoản">
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.dark" }}>A</Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* User menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Tài khoản</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đăng xuất</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notification menu */}
      <Menu
        anchorEl={notificationEl}
        open={Boolean(notificationEl)}
        onClose={handleNotificationClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: { width: 320, maxWidth: "100%" },
        }}
      >
        <MenuItem>
          <ListItemText
            primary="Người dùng mới đăng ký"
            secondary="Nguyễn Văn A đã đăng ký tài khoản"
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemText
            primary="Bài viết mới được đăng"
            secondary="Trần Thị B đã đăng một bài viết mới"
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemText
            primary="Báo cáo vi phạm mới"
            secondary="Có 2 báo cáo vi phạm cần xử lý"
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemText
            primary="Bình luận cần kiểm duyệt"
            secondary="5 bình luận đang chờ kiểm duyệt"
            secondaryTypographyProps={{ fontSize: "0.75rem" }}
          />
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="mailbox folders">
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={isMobile && open}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: "1px solid rgba(0, 0, 0, 0.12)",
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              ...(!open && {
                overflowX: "hidden",
                width: theme.spacing(7),
                transition: theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
              }),
            },
          }}
          open={open}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${open ? drawerWidth : theme.spacing(7)}px)` },
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          height: "100vh",
          overflow: "auto",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default AdminLayout
