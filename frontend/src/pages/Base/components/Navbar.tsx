import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material"
import {
  Chat,
  Notifications,
  Search,
  Settings,
  Logout,
  Person,
  Menu as MenuIcon,
  Home,
  Explore,
  Bookmark,
} from "@mui/icons-material"
import { logout } from "../../../services/authService"
import { useCurrentUser } from "../../../contexts/currentUserContext"

interface NavbarProps {
  onMenuToggle?: () => void
}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { currentUser } = useCurrentUser() ?? {}
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const open = Boolean(anchorEl)
  const navigate = useNavigate()

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      if (isMobile) {
        setShowMobileSearch(false)
      }
    }
  }

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        elevation={3}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
          width: "100%",
          left: 0,
          right: 0,
          top: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxSizing: "border-box",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1, md: 2 },
          }}
        >
          <Toolbar disableGutters sx={{ height: 64 }}>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleMobileMenu}
                sx={{ mr: 1, outline: "none", "&:focus": { outline: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Typography
              variant={isMobile ? "h6" : "h5"}
              component={Link}
              to="/"
              sx={{
                color: "#4f46e5",
                fontWeight: "bold",
                textDecoration: "none",
                flexGrow: { xs: 1, md: 0 },
                mr: { md: 3 },
                textAlign: "left",
              }}
            >
              AstraSocial
            </Typography>

            {/* Search bar - Desktop */}
            {!isMobile && (
              <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, maxWidth: "500px" }}>
                <TextField
                  placeholder="Tìm kiếm..."
                  size="small"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "20px",
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                />
              </Box>
            )}

            {/* User menu */}
            <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={toggleMobileSearch}
                  sx={{ outline: "none", "&:focus": { outline: "none" } }}
                >
                  <Search />
                </IconButton>
              )}
              <IconButton color="inherit" sx={{ outline: "none", "&:focus": { outline: "none" } }}>
                <Notifications />
              </IconButton>
              <IconButton color="inherit" sx={{ outline: "none", "&:focus": { outline: "none" } }}>
                <Chat />
              </IconButton>
              <IconButton
                onClick={handleProfileClick}
                aria-controls={open ? "profile-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                sx={{ outline: "none", "&:focus": { outline: "none" } }}
              >
                <Avatar
                  src={currentUser?.avatar || ""}
                  sx={{
                    width: 36,
                    height: 36,
                    ml: 1,
                    cursor: "pointer",
                    border: "2px solid",
                    borderColor: "transparent",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                />
              </IconButton>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "profile-button",
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <MenuItem
                  onClick={handleClose}
                  component={Link}
                  to={currentUser ? `/profile/${currentUser.email}` : "/profile"}
                >
                  <Person fontSize="small" sx={{ mr: 1 }} />
                  Trang cá nhân
                </MenuItem>
                <MenuItem onClick={handleClose} component={Link} to="/settings">
                  <Settings fontSize="small" sx={{ mr: 1 }} />
                  Cài đặt
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout fontSize="small" sx={{ mr: 1 }} />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>

          {/* Mobile Search Bar */}
          {isMobile && showMobileSearch && (
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{
                py: 1,
                px: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <TextField
                placeholder="Tìm kiếm..."
                size="small"
                fullWidth
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              />
            </Box>
          )}
        </Container>
      </AppBar>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          "& .MuiDrawer-paper": {
            width: "70%",
            maxWidth: "300px",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            sx={{
              color: "#4f46e5",
              fontWeight: "bold",
              textDecoration: "none",
              display: "block",
              mb: 2,
            }}
          >
            AstraSocial
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem component={Link} to="/" onClick={() => setMobileMenuOpen(false)}>
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Trang chủ" />
          </ListItem>
          <ListItem
            component={Link}
            to={currentUser ? `/profile/${currentUser.email}` : "/profile"}
            onClick={() => setMobileMenuOpen(false)}
          >
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Trang cá nhân" />
          </ListItem>
          <ListItem component={Link} to="/explore" onClick={() => setMobileMenuOpen(false)}>
            <ListItemIcon>
              <Explore />
            </ListItemIcon>
            <ListItemText primary="Khám phá" />
          </ListItem>
          <ListItem component={Link} to="/saved" onClick={() => setMobileMenuOpen(false)}>
            <ListItemIcon>
              <Bookmark />
            </ListItemIcon>
            <ListItemText primary="Đã lưu" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem component={Link} to="/settings" onClick={() => setMobileMenuOpen(false)}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Cài đặt" />
          </ListItem>
          <ListItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItem>
        </List>
      </Drawer>
    </>
  )
}

export default Navbar
