import type React from "react";
import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Search,
  PersonAdd,
  People,
  PersonAddDisabled,
} from "@mui/icons-material";
import BasePage from "../Base/BasePage";
import FriendRequests from "./components/FriendRequests";
import FriendsList from "./components/FriendList";
import FriendSent from "./components/FriendSent";
import axios from "axios";
import { useCurrentUser } from "../../contexts/currentUserContext";
import FriendSuggest from "./components/FriendSuggest";

// Define the tab values
type FriendTab = "all" | "requests" | "suggestions" | "sent";

const FriendsPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState<FriendTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setFriends] = useState([]);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!currentUser?.id) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("No access token found");
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/friendships/user/${currentUser.id}/friends`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
        if (axios.isAxiosError(error)) {
          console.error("Error details:", error.response?.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [currentUser?.id]);

  // Handle tab change
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: FriendTab
  ) => {
    setActiveTab(newValue);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return <FriendsList />;
      case "requests":
        return <FriendRequests />;
      case "suggestions":
        return <FriendSuggest />;
      case "sent":
        return <FriendSent />;
      default:
        return null;
    }
  };

  return (
    <BasePage>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <People sx={{ mr: 1 }} />
            Bạn bè
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Kết nối với bạn bè và khám phá những người bạn mới trên
            SocialConnect.
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 400,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            renderContent()
          )}
        </Box>
      </Container>
    </BasePage>
  );
};

export default FriendsPage;
