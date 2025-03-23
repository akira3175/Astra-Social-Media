import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ReactNode } from 'react'
import './App.css'
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from "./pages/Auth/LoginPage"
import HomePage from "./pages/Home/HomePage";
import { isAuthenticated } from "./services/authService"

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

const AppContent: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          {/* Thêm các route khác ở đây */}
        </Routes>
      </Router>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;