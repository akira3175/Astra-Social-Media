import type React from "react"
import { useState } from "react"
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Divider,
} from "@mui/material"
import { Search, PersonAdd, People, PersonAddDisabled } from "@mui/icons-material"
import BasePage from "../Base/BasePage"
import FriendRequests from "./components/FriendRequests"
import FriendSuggestions from "./components/FriendSuggestions"
import FriendsList from "./components/FriendList"
// import { useCurrentUser } from "../../contexts/currentUserContext"

// Define the tab values
type FriendTab = "all" | "requests" | "suggestions" | "sent"

const FriendsPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [activeTab, setActiveTab] = useState<FriendTab>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, ] = useState(false)
//   const { currentUser } = useCurrentUser()

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: FriendTab) => {
    setActiveTab(newValue)
  }

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return <FriendsList searchQuery={searchQuery} />
      case "requests":
        return <FriendRequests />
      case "suggestions":
        return <FriendSuggestions />
      case "sent":
        return (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <PersonAddDisabled sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Lời mời đã gửi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bạn chưa gửi lời mời kết bạn nào.
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
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
            <People sx={{ mr: 1 }} />
            Bạn bè
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Kết nối với bạn bè và khám phá những người bạn mới trên SocialConnect.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Search bar */}
          <TextField
            fullWidth
            placeholder="Tìm kiếm bạn bè..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{ mb: 3 }}
          >
            <Tab
              icon={<People />}
              label="Tất cả bạn bè"
              value="all"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              icon={<PersonAdd />}
              label="Lời mời kết bạn"
              value="requests"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              icon={<PersonAdd />}
              label="Gợi ý kết bạn"
              value="suggestions"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
            <Tab
              icon={<PersonAddDisabled />}
              label="Đã gửi"
              value="sent"
              iconPosition="start"
              sx={{ minHeight: 48, textTransform: "none" }}
            />
          </Tabs>
        </Paper>

        {/* Main content */}
        <Box sx={{ minHeight: 500 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderContent()
          )}
        </Box>
      </Container>
    </BasePage>
  )
}

export default FriendsPage
