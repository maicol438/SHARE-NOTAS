import { useState, useRef, useEffect } from "react";
import { Moon, Sun, LogOut, Menu, User, ChevronDown, StickyNote, Search, Plus, FileText, Star, CheckSquare } from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode.js";
import useAuthStore from "../../stores/useAuthStore.js";
import useNoteStore from "../../stores/useNoteStore.js";
import { showToast } from "../../utils/toast.jsx";
import { useNavigate, Link } from "react-router-dom";

const Navbar = ({ onMenuToggle, onNewNote }) => {
  const { isDark, toggle } = useDarkMode();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef(null);

  const { notes = [], categories = [] } = useNoteStore();
  const totalNotes = notes?.length || 0;
  const totalFavorites = notes?.filter((n) => n.isFavorite)?.length || 0;

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

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-white/[0.06] bg-[#070714]/90 backdrop-blur-2xl flex items-center px-4 md:px-5 gap-3 sticky top-0 z-30 shadow-lg shadow-black/20">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-white/[0.06] transition-all text-slate-400 hover:text-white border border-transparent hover:border-white/[0.06]"
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>

        {/* Mobile Logo */}
        <Link to="/" className="flex items-center gap-2.5 group lg:hidden">
          <div className="hex-logo" style={{ width: 32, height: 32 }}>
            <div className="hex-logo-inner" style={{ width: 28, height: 28 }}>
              <span className="font-extrabold text-xs bg-gradient-to-br from-primary-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">SN</span>
            </div>
          </div>
          <span className="font-bold text-sm tracking-wide text-white group-hover:text-primary-400 transition-colors">ShareNotes</span>
        </Link>

        {/* Desktop: Search bar centered */}
        <div className="hidden lg:flex flex-1 max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Búsqueda..."
            className="w-full pl-9 pr-4 py-2 bg-white/[0.05] border border-white/[0.07] rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>

        {/* Desktop: Stats */}
        <div className="hidden lg:flex items-center gap-1 ml-4">
          <StatChip icon={FileText} label="Total Notas" value={totalNotes} />
          <div className="w-px h-5 bg-white/[0.07] mx-1" />
          <StatChip icon={Star} label="Favoritos" value={totalFavorites} color="text-yellow-400" />
          <div className="w-px h-5 bg-white/[0.07] mx-1" />
          <StatChip icon={CheckSquare} label="Tareas (0/0)" value={0} color="text-emerald-400" />
        </div>

        {/* Spacer */}
        <div className="flex-1 lg:flex-none" />

        {/* + Nueva Nota button */}
        <button
          onClick={onNewNote}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group/btn"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Nueva Nota</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all border border-transparent hover:border-white/[0.06] active:scale-95"
          aria-label="Cambiar tema"
        >
          {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 px-2 rounded-xl hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/[0.06] group"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all">
                <span className="text-white font-bold text-sm uppercase">{user?.name?.charAt(0)}</span>
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-xs font-bold text-white group-hover:text-primary-300 transition-colors">
                {user?.name?.split(" ")[0]}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">{user?.name?.split(" ").slice(1).join(" ")}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 hidden sm:block transition-transform duration-300 ${showUserMenu ? "rotate-180 text-primary-400" : ""}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#0d0b1f]/98 backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/60 p-1.5 animate-scale-in z-50">
              <div className="px-3.5 py-2.5 border-b border-white/[0.06] mb-1">
                <p className="font-bold text-sm text-white truncate leading-snug">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowUserMenu(false); navigate("/dashboard/profile"); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06] rounded-xl transition-all font-semibold"
              >
                <User className="w-4 h-4 text-slate-500" />
                Perfil
              </button>
              <button
                onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div className="max-w-sm w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#0d0b1f] border border-white/[0.08] rounded-3xl p-7 text-center shadow-2xl">
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
                  <LogOut className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="font-extrabold text-lg text-white tracking-wide">Cerrar sesión</h3>
                <p className="text-sm text-slate-400">¿Estás seguro de que deseas cerrar sesión?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.06] text-slate-300 font-bold hover:bg-white/[0.1] transition-all border border-white/[0.06]">
                  Cancelar
                </button>
                <button onClick={handleLogout} className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-all border border-red-500/20">
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const StatChip = ({ icon: Icon, label, value, color = "text-primary-400" }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] transition-all cursor-default group">
    <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
    <div className="flex items-center gap-1.5 leading-none">
      <span className="text-sm font-extrabold text-white tabular-nums">{value}</span>
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden xl:block">{label}</span>
    </div>
  </div>
);

export default Navbar;
