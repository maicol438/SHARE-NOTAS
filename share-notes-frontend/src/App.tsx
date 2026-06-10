import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import useAuthStore from './stores/useAuthStore';
import { onUnauthorized } from './api/axios';
import { connectSocket, disconnectSocket } from './services/socket';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardPage from './pages/Dashboard';
import Explore from './pages/Explore';
import SearchPage from './pages/Search';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Tasks from './pages/Tasks';
import Files from './pages/Files';
import CalendarPage from './pages/Calendar';
import Shared from './pages/Shared';
import Admin from './pages/Admin';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import Privacy from './pages/Privacy';

import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

const App = () => {
  const checkAuth = useAuthStore((s: { checkAuth: () => void }) => s.checkAuth);
  const isAuthenticated = useAuthStore((s: { isAuthenticated: boolean }) => s.isAuthenticated);

  useEffect(() => {
    onUnauthorized(() => {
      useAuthStore.setState({ user: null, isAuthenticated: false, isCheckingAuth: false });
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        containerClassName="!top-4 !right-4"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
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
          <Route index element={<DashboardPage />} />
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
