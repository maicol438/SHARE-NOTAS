import { Navigate } from "react-router-dom";
import { BookOpen, Loader } from "lucide-react";
import useAuthStore from "../stores/useAuthStore.js";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-primary-500/30 animate-pulse-glow">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="font-medium">Verificando sesión...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;