import { useState, useRef, useEffect } from "react";
import { Moon, Sun, LogOut, Menu, User, ChevronDown, Settings, StickyNote } from "lucide-react";
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
      <header className="h-14 border-b border-surface-800/60 bg-surface-950/80 backdrop-blur-xl flex items-center px-3 gap-2 sticky top-0 z-30">
        <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-surface-800 transition-all text-surface-400 hover:text-surface-200">
          <Menu className="w-[18px] h-[18px]" />
        </button>

        <Link to="/" className="flex items-center gap-2 mr-auto group">
          <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
            <StickyNote className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-surface-200 hidden sm:block group-hover:text-white transition-colors">ShareNotes</span>
        </Link>

        <div className="flex items-center gap-1">
          <button onClick={toggle}
            className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-surface-200 transition-all"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-800 transition-all group"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full ring-1 ring-surface-700" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-surface-800 flex items-center justify-center ring-1 ring-surface-700">
                  <User className="w-3.5 h-3.5 text-surface-400" />
                </div>
              )}
              <span className="text-sm font-medium text-surface-300 hidden md:block group-hover:text-surface-100 transition-colors">
                {user?.name?.split(" ")[0]}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-surface-500 hidden md:block transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-900 rounded-xl border border-surface-700 shadow-tesla-lg p-1.5 animate-scale-in z-50">
                <div className="px-3 py-2 border-b border-surface-800 mb-1">
                  <p className="font-medium text-sm text-surface-200 truncate">{user?.name}</p>
                  <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                </div>
                <button onClick={() => { setShowUserMenu(false); navigate("/dashboard/profile"); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-surface-300 hover:bg-surface-800 rounded-lg transition-all">
                  <User className="w-4 h-4" />
                  Perfil
                </button>
                <button onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-surface-900 rounded-xl p-6 max-w-sm w-full animate-scale-in border border-surface-700 shadow-tesla-lg" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="font-semibold text-surface-100">Cerrar sesión</h3>
              <p className="text-sm text-surface-500">¿Estás seguro?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleLogout} className="btn-danger flex-1">Cerrar sesión</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
