import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useAuthStore from "./stores/useAuthStore.js";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Explore from "./pages/Explore.jsx";

import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();
  if (isCheckingAuth) {
    return (
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
  }
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
        containerStyle={{ position: "relative", zIndex: 9999 }}
        toastOptions={{
          duration: 4000,
          className: "!rounded-2xl !shadow-2xl !border-0 !overflow-hidden",
        }}
      >
        {(t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isLoading = t.type === "loading";

          return (
            <div
              className={`
                flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl
                transform transition-all duration-500 ease-out
                pointer-events-auto
                ${isSuccess ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white animate-[slideIn_0.5s_ease-out]" : ""}
                ${isError ? "bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white animate-[shake_0.5s_ease-out]" : ""}
                ${isLoading ? "bg-gray-800 text-white" : ""}
              `}
              style={{
                animation: isError ? "shake 0.5s ease-out" : isSuccess ? "slideIn 0.5s ease-out" : undefined,
                minWidth: "280px",
                maxWidth: "400px",
              }}
            >
              {/* Icon */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${isSuccess ? "bg-white/20 backdrop-blur-sm" : ""}
                  ${isError ? "bg-white/20 backdrop-blur-sm" : ""}
                  ${isLoading ? "bg-white/10" : ""}
                `}
              >
                {isSuccess && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isError && (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{t.message}</p>
              </div>

              {/* Progress bar */}
              {t.duration && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className={`h-full bg-white/40 rounded-full ${isSuccess ? "animate-[shrink_4s_linear]" : ""}`}
                    style={{ width: "100%", animation: `shrink ${t.duration}ms linear forwards` }}
                  />
                </div>
              )}
            </div>
          );
        }}
      </Toaster>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-100%) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="explore" element={<Explore />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;