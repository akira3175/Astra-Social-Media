import type React from "react"
import { Link } from "react-router-dom"
import { Box, IconButton, Paper } from "@mui/material"
import { Chat, Create, Explore, Home as HomeIcon, Notifications, Person } from "@mui/icons-material"

interface MobileNavItem {
  icon: React.ReactNode
  path: string
  active?: boolean
}

const MobileBottomNav: React.FC = () => {
  const navItems: MobileNavItem[] = [
    { icon: <HomeIcon />, path: "/", active: true },
    { icon: <Explore />, path: "/explore" },
    { icon: <Notifications />, path: "/notifications" },
    { icon: <Chat />, path: "/messages" },
    { icon: <Person />, path: "/profile" },
  ]

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
      elevation={3}
    >
      <Box sx={{ display: "flex", justifyContent: "space-around" }}>
        {navItems.map((item, index) => (
          <IconButton
            key={index}
            component={Link}
            to={item.path}
            sx={{
              py: 1,
              color: item.active ? "#4f46e5" : "inherit",
              borderRadius: 0,
              flexGrow: 1,
            }}
          >
            {item.icon}
          </IconButton>
        ))}
      </Box>
      <IconButton
        component={Link}
        to="/create-post"
        sx={{
          py: 1,
          bgcolor: "#4f46e5",
          color: "white",
          borderRadius: "50%",
          position: "absolute",
          bottom: 60,
          right: 20,
          "&:hover": { bgcolor: "#4338ca" },
          width: 56,
          height: 56,
          boxShadow: 3,
        }}
      >
        <Create />
      </IconButton>
    </Paper>
  )
}

export default MobileBottomNav

