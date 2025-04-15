import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ReactNode } from 'react'
import './App.css'
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from "./pages/Auth/LoginPage"
import HomePage from "./pages/Home/HomePage";
import { isAuthenticated } from "./services/authService"
import NotFound from "./pages/Status/NotFound";
import ProfilePage from "./pages/Profile/ProfilePage";
import { CurrentUserProvider } from "./contexts/currentUserContext";
import AdminPage from "./pages/Admin/AdminPage";
import SearchPage from "./pages/Search/SearchPage";
import AdminLoginPage from "./pages/Admin/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import { Provider } from 'react-redux'
import store from './redux/store'
import useWebSocket from "./hooks/useWebSocket";
import MessagesPage from "./pages/Messages/MessagesPage";
import CommentManagementPage from "./pages/Admin/CommentManagementPage";
import PostManagementPage from "./pages/Admin/PostManagementPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import DashboardPage from "./pages/Admin/DashboardPage";
import ProfileSetupPage from "./pages/Auth/ProfileSetupPage";
import PrivacyPolicyPage from "./pages/Legal/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/Legal/TermsOfServicePage";
import SettingsPage from "./pages/Settings/SettingsPage";
import FriendsPage from "./pages/Friends/FriendsPage"

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: "#4f46e5", // Indigo color
    },
    secondary: {
      main: "#a855f7", // Purple color
    },
    background: {
      default: "#f0f5ff",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

// Protected Route component
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

  const authenticated = isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Protected Admin Route component
// interface ProtectedAdminRouteProps {
//   children: ReactNode;
// }

// const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
//   const authenticated = isAuthenticated();
//   // TODO: Add admin role check here
//   const isAdmin = true; // This should be replaced with actual admin role check

//   if (!authenticated || !isAdmin) {
//     return <Navigate to="/login" />;
//   }

//   return <>{children}</>;
// };

const AppContent: React.FC = () => {
  useWebSocket()
    
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/posts" element={<PostManagementPage />} />
          <Route path="/admin/comments" element={<CommentManagementPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />

          {/* Các Route cần bảo vệ */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:email"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              // <ProtectedRoute>
                <FriendsPage />
              /* </ProtectedRoute> */
            }
          />
          {/* Các route khác có thể thêm vào đây */}
        </Routes>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <CurrentUserProvider>
          <AppContent />
        </CurrentUserProvider>
      </Provider>
    </ThemeProvider>
  );
};

export default App;