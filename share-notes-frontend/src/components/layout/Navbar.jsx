import { useState, useRef, useEffect } from "react";
import { Moon, Sun, LogOut, BookOpen, Menu, User, ChevronDown, Settings, AlertTriangle } from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import useAuthStore from "../../stores/useAuthStore.js";
import Tooltip from "../ui/Tooltip.jsx";
import { showToast } from "../../utils/toast.jsx";
import { useNavigate, Link } from "react-router-dom";

const Navbar = ({ onMenuToggle }) => {
  const { isDark, toggle } = useDarkMode();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setShowUserMenu(false);
    await logout();
    showToast("Sesión cerrada correctamente", "success");
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-gray-100 dark:border-dark-800 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl flex items-center px-4 gap-3 sticky top-0 z-40">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-all hover:scale-105 active:scale-90"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Link to="/" className="flex items-center gap-2.5 mr-auto group">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/50 group-hover:scale-105 transition-all duration-300">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-sm hidden sm:block gradient-text">ShareNotes</span>
      </Link>

      <div className="flex items-center gap-2">
        <Tooltip text={isDark ? "Modo claro" : "Modo oscuro"} position="bottom">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-all hover:scale-105 active:scale-90"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
        </Tooltip>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-all hover:scale-105 active:scale-90 group"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-primary-500/30 group-hover:ring-primary-500/50 transition-all" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-primary-500/30 group-hover:ring-primary-500/50 transition-all">
                {user?.name?.charAt(0) || <User className="w-4 h-4" />}
              </div>
            )}
            <span className="text-sm font-semibold text-gray-700 dark:text-dark-300 hidden md:block">
              {user?.name?.split(" ")[0]}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 hidden md:block transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-900 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-800 p-2 animate-scale-in z-50">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-800 mb-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button onClick={() => { setShowUserMenu(false); navigate("/dashboard/profile"); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-800 rounded-xl transition-all">
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              <button onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-sm w-full mx-4 animate-scale-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center animate-bounce-subtle">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Cerrar sesión</h3>
              <p className="text-sm text-gray-500">¿Estás seguro de que quieres cerrar sesión?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleLogout} className="flex-1 btn-danger">Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
