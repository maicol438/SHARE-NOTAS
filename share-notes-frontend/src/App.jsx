import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useAuthStore from "./stores/useAuthStore";
import { onUnauthorized } from "./api/axios";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Explore from "./pages/Explore.jsx";
import SearchPage from "./pages/Search.jsx";
import Profile from "./pages/Profile.jsx";
import Stats from "./pages/Stats.jsx";
import Tasks from "./pages/Tasks.jsx";
import Files from "./pages/Files.jsx";
import CalendarPage from "./pages/Calendar.jsx";
import Shared from "./pages/Shared.jsx";
import Admin from "./pages/Admin.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Privacy from "./pages/Privacy.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-500 animate-pulse font-medium">Cargando...</p>
    </div>
  </div>
);

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    onUnauthorized(() => {
      useAuthStore.setState({ user: null, isAuthenticated: false, isCheckingAuth: false });
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 2000,
          style: {
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          },
          success: {
            iconTheme: { primary: "#6366f1", secondary: "#fff" },
            style: {
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "#fff",
            },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "#fff" },
            style: {
              background: "linear-gradient(135deg, #b91c1c, #dc2626)",
              color: "#fff",
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="explore" element={<Explore />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="stats" element={<Stats />} />
          <Route path="profile" element={<Profile />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="files" element={<Files />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="shared" element={<Shared />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
