import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ReactNode } from 'react'
import './App.css'
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from "./pages/Auth/LoginPage"
import HomePage from "./pages/Home/HomePage";
import { isAuthenticated } from "./services/AuthService"
import NotFound from "./pages/Status/NotFound";
import ProfilePage from "./pages/Profile/ProfilePage";
import { CurrentUserProvider } from "./contexts/currentUserContext";
import AdminPage from "./pages/Admin/AdminPage";
import SearchPage from "./pages/Search/SearchPage";
import AdminLoginPage from "./pages/Admin/Login/AdminLoginPage";

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
  // const authenticated = isAuthenticated(); 

  // if (!authenticated) {
  //   return <Navigate to="/login" />;
  // }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/404" element={<NotFound />} />

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

          {/* Các route khác có thể thêm vào đây */}
        </Routes>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CurrentUserProvider>
        <AppContent />
      </CurrentUserProvider>

    </ThemeProvider>
  );
};

export default App;