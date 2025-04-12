import type React from "react"
import { useState } from "react"
import {
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
  IconButton,
  Drawer,
} from "@mui/material"
import { Lock, Person, Notifications, Security, Menu as MenuIcon } from "@mui/icons-material"
import BasePage from "../Base/BasePage"
import PasswordChangeForm from "./components/PasswordChangeForm"
import { useCurrentUser } from "../../contexts/currentUserContext"

// Define the settings sections
type SettingsSection = "password" | "profile" | "notifications" | "privacy"

const SettingsPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [activeSection, setActiveSection] = useState<SettingsSection>("password")
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const { currentUser } = useCurrentUser()

  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section)
    if (isMobile) {
      setMobileDrawerOpen(false)
    }
  }

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen)
  }

  // Settings navigation items
  const settingsNavItems = [
    { id: "password" as SettingsSection, label: "Đổi mật khẩu", icon: <Lock /> },
    { id: "profile" as SettingsSection, label: "Thông tin cá nhân", icon: <Person /> },
    { id: "notifications" as SettingsSection, label: "Thông báo", icon: <Notifications /> },
    { id: "privacy" as SettingsSection, label: "Quyền riêng tư", icon: <Security /> },
  ]

  // Sidebar content
  const sidebarContent = (
    <>
      <Typography variant="h6" sx={{ p: 2, fontWeight: 600 }}>
        Cài đặt
      </Typography>
      <Divider />
      <List sx={{ width: "100%" }}>
        {settingsNavItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => handleSectionChange(item.id)}
              sx={{
                borderRadius: 1,
                mx: 1,
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
                  color: activeSection === item.id ? "primary.main" : "inherit",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  )

  // Render the appropriate content based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case "password":
        return <PasswordChangeForm />
      case "profile":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cá nhân
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng này đang được phát triển.
            </Typography>
          </Box>
        )
      case "notifications":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cài đặt thông báo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng này đang được phát triển.
            </Typography>
          </Box>
        )
      case "privacy":
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cài đặt quyền riêng tư
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tính năng này đang được phát triển.
            </Typography>
          </Box>
        )
      default:
        return null
    }
  }

  return (
    <BasePage>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Mobile header with menu button */}
        {isMobile && (
          <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
            <IconButton edge="start" color="inherit" onClick={toggleMobileDrawer} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">
              Cài đặt - {settingsNavItems.find((item) => item.id === activeSection)?.label}
            </Typography>
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Left sidebar - Desktop */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <Paper
                sx={{
                  height: "100%",
                  position: "sticky",
                  top: 80,
                }}
              >
                {sidebarContent}
              </Paper>
            </Grid>
          )}

          {/* Mobile drawer */}
          {isMobile && (
            <Drawer
              anchor="left"
              open={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
              sx={{
                "& .MuiDrawer-paper": {
                  width: 280,
                  boxSizing: "border-box",
                },
              }}
            >
              {sidebarContent}
            </Drawer>
          )}

          {/* Main content */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ minHeight: 500 }}>{renderContent()}</Paper>
          </Grid>
        </Grid>
      </Container>
    </BasePage>
  )
}

export default SettingsPage
