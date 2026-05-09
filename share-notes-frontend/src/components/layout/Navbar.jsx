import { Moon, Sun, LogOut, BookOpen, Menu, User } from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import useAuthStore from "../../stores/useAuthStore.js";
import Tooltip from "../ui/Tooltip.jsx";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const { isDark, toggle } = useDarkMode();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl flex items-center px-4 gap-3 sticky top-0 z-40">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link to="/" className="flex items-center gap-2 mr-auto">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-sm hidden sm:block gradient-text">ShareNotes</span>
      </Link>

      <div className="flex items-center gap-3">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full shadow-md" />
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md">
            {user?.name?.charAt(0) || <User className="w-4 h-4" />}
          </div>
        )}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300 hidden md:block">
          {user?.name?.split(" ")[0]}
        </span>
      </div>

      <Tooltip text={isDark ? "Modo claro" : "Modo oscuro"} position="bottom">
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
        </button>
      </Tooltip>

      <Tooltip text="Cerrar sesión" position="bottom">
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </Tooltip>
    </header>
  );
};

export default Navbar;
