import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useAuthStore from "./stores/useAuthStore";

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
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerClassName="mt-4 pointer-events-none"
        toastOptions={{ duration: 4000, className: "!rounded-2xl !shadow-2xl" }}
      >
        {(t) => {
          const styles = {
            success: "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white",
            error: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
            loading: "bg-gray-800 text-white",
          };
          return (
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl ${styles[t.type] || styles.loading}`}>
              {t.type === "success" && <span>✓</span>}
              {t.type === "error" && <span>✕</span>}
              {t.type === "loading" && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span className="font-semibold text-sm">{t.message}</span>
            </div>
          );
        }}
      </Toaster>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;