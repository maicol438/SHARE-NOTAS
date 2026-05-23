import { useState, useRef, useEffect } from "react";
import { Moon, Sun, LogOut, Menu, User, ChevronDown, StickyNote } from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import useAuthStore from "../../stores/useAuthStore.js";
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
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setShowUserMenu(false);
    await logout();
    showToast("Sesión cerrada", "success");
    navigate("/login");
  };

  return (
    <>
      <header className="h-16 border-b border-gray-200/50 dark:border-white/[0.04] bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl flex items-center px-4 md:px-5 gap-3 sticky top-0 z-30 shadow-sm shadow-gray-200/[0.02] dark:shadow-black/[0.02]">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-all text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-100 border border-transparent dark:hover:border-white/[0.04]"
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>

        {/* Small Logo for mobile/tablet */}
        <Link to="/" className="flex items-center gap-2.5 mr-auto group lg:hidden">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg opacity-40 blur-xs group-hover:opacity-75 transition-all duration-300" />
            <div className="relative w-7 h-7 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <StickyNote className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <span className="font-bold text-sm tracking-wide text-gray-800 dark:text-dark-100 group-hover:text-primary-500 transition-colors">
            ShareNotes
          </span>
        </Link>

        {/* Spacer for desktop layout */}
        <div className="hidden lg:block mr-auto" />

        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-100 transition-all border border-transparent dark:hover:border-white/[0.04] active:scale-95 relative group/theme"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-purple-500/0 opacity-0 group-hover/theme:opacity-100 transition-opacity duration-300" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 px-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-all border border-transparent dark:hover:border-white/[0.04] group"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-7.5 h-7.5 rounded-full object-cover ring-2 ring-primary-500/10 group-hover:ring-primary-500/30 transition-all duration-300"
                />
              ) : (
                <div className="w-7.5 h-7.5 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center ring-2 ring-primary-500/10 group-hover:ring-primary-500/30 transition-all duration-300">
                  <User className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <span className="text-xs font-bold text-gray-700 dark:text-dark-300 hidden sm:block group-hover:text-gray-900 dark:group-hover:text-dark-100 transition-colors leading-none">
                {user?.name?.split(" ")[0]}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 hidden sm:block ${
                  showUserMenu ? "rotate-180 text-primary-500" : ""
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-dark-900/95 backdrop-blur-2xl rounded-2xl border border-gray-200/50 dark:border-white/[0.06] shadow-2xl p-1.5 animate-scale-in z-50">
                <div className="px-3.5 py-2.5 border-b border-gray-200/40 dark:border-white/[0.04] mb-1">
                  <p className="font-bold text-sm text-gray-800 dark:text-dark-200 truncate leading-snug">{user?.name}</p>
                  <p className="text-2xs text-gray-400 dark:text-dark-500 truncate leading-none mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/dashboard/profile");
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-800/60 rounded-xl transition-all font-bold"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  Perfil
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirm Dialog */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="max-w-sm w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="card-neon">
              <div className="card-neon-inner p-7 text-center">
                <div className="flex flex-col items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center shadow-lg shadow-red-500/10">
                    <LogOut className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-800 dark:text-dark-100 tracking-wide">Cerrar sesión</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400">¿Estás seguro de que deseas cerrar sesión?</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary flex-1 font-bold">
                    Cancelar
                  </button>
                  <button onClick={handleLogout} className="btn-danger flex-1 font-bold">
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
