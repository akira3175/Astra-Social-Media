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
import AdminDashboard from "./pages/Admin/AdminDashboard";
import RegisterPage from "./pages/Auth/RegisterPage";
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
interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ children }) => {
  const authenticated = isAuthenticated();
  // TODO: Add admin role check here
  const isAdmin = true; // This should be replaced with actual admin role check

  if (!authenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/404" element={<NotFound />} />

            {/* Protected Routes */}
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

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/404" replace />} />
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