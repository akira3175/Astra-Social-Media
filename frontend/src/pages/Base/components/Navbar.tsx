import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
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
} from "@mui/material"
import { Chat, Notifications, Search, Settings, Logout, Person } from "@mui/icons-material"
import { useCurrentUser } from "../../../hooks/useCurrentUser"
import { logout } from "../../../services/authService"

interface NavbarProps {
  onMenuToggle?: () => void
}

const Navbar: React.FC<NavbarProps> = ({  }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const currentUser = useCurrentUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
  }

  return (
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
          px: { xs: 1, md: 2 }, // Giảm padding
        }}
      >
        <Toolbar disableGutters sx={{ height: 64 }}>
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

          {/* Search bar */}
          {!isMobile && (
            <TextField
              placeholder="Tìm kiếm..."
              size="small"
              sx={{
                width: { sm: "30%", md: "40%" },
                mx: 2,
                flexGrow: 1,
                maxWidth: "500px",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* User menu */}
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            {isMobile && (
              <IconButton color="inherit">
                <Search />
              </IconButton>
            )}
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            <IconButton color="inherit">
              <Chat />
            </IconButton>
            <IconButton
              onClick={handleProfileClick}
              aria-controls={open ? "profile-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                src={(currentUser)?.avatar || "https://i.pravatar.cc/150?img=3"}
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
              <MenuItem onClick={handleClose} component={Link} to="/profile">
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
      </Container>
    </AppBar>
  )
}

export default Navbar

