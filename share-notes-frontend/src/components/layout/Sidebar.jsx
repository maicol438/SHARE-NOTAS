import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  StickyNote,
  CheckSquare,
  FolderOpen,
  Calendar,
  FileText,
  Tag as TagIcon,
  Search,
  BarChart3,
  User,
  ChevronDown,
  ChevronLeft,
  Plus,
  Star,
  Trash2,
  Users,
  Trash,
  BookOpen,
  Sparkles,
  Shield,
} from "lucide-react";
import useNoteStore from "../../stores/useNoteStore";
import useAuthStore from "../../stores/useAuthStore";

const navItems = [
  { id: "home", label: "Mis Notas", icon: Home, path: "/dashboard", color: "text-primary-500" },
  { id: "favorites", label: "Favoritos", icon: Star, path: "/dashboard?tab=favorites", color: "text-yellow-500" },
  { id: "tasks", label: "Tareas", icon: CheckSquare, path: "/dashboard/tasks", color: "text-emerald-500" },
  { id: "files", label: "Archivos", icon: FolderOpen, path: "/dashboard/files", color: "text-violet-500" },
  { id: "calendar", label: "Calendario", icon: Calendar, path: "/dashboard/calendar", color: "text-blue-500" },
  { id: "shared", label: "Compartido", icon: Users, path: "/dashboard/shared", color: "text-indigo-500" },
  { id: "trash", label: "Papelera", icon: Trash2, path: "/dashboard?tab=trash", color: "text-red-400" },
];

const getToolsItems = (isAdmin) => [
  { id: "search", label: "Buscar", icon: Search, path: "/dashboard/search" },
  { id: "stats", label: "Estadísticas", icon: BarChart3, path: "/dashboard/stats" },
  { id: "profile", label: "Perfil", icon: User, path: "/dashboard/profile" },
  ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield, path: "/dashboard/admin" }] : []),
];

export default function Sidebar({ onNavClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories = [], notebooks = [], fetchCategories, fetchNotebooks, createNotebook, deleteNotebook } = useNoteStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";
  const toolsItems = getToolsItems(isAdmin);

  const [showNotebooks, setShowNotebooks] = useState(true);
  const [showCategories, setShowCategories] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [creating, setCreating] = useState(false);

  const isActive = (path) => {
    if (path.startsWith("/dashboard?")) {
      const query = location.search;
      return query.includes(path.split("?")[1]);
    }
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" && !location.search;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleNavClick = () => {
    if (onNavClick) {
      onNavClick();
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchNotebooks();
  }, []);

  return (
    <aside className={`flex flex-col h-full bg-white dark:bg-dark-900 border-r border-gray-100 dark:border-dark-800 transition-all duration-300 relative z-20 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-800">
        {!isCollapsed && (
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-primary-500/40 transition-all">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold gradient-text text-sm">ShareNotes</span>
          </button>
        )}
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 hidden lg:block transition-all hover:scale-105">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
        {!isCollapsed && (
          <button onClick={() => { handleNavClick(); navigate("/dashboard"); }} className="flex items-center gap-2 w-full mb-4 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group">
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>Nueva nota rápida</span>
          </button>
        )}

        <nav className="space-y-0.5 mb-6">
          {!isCollapsed && <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">General</p>}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.id} to={item.path} onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${active
                    ? "bg-gradient-to-r from-primary-500/10 to-purple-500/10 dark:from-primary-500/20 dark:to-purple-500/20 font-semibold"
                    : "hover:bg-gray-50 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${active ? item.color : "text-gray-400 dark:text-dark-500 group-hover:scale-110"}`} />
                {!isCollapsed && <span className={`text-sm ${active ? "text-gray-900 dark:text-gray-100" : ""}`}>{item.label}</span>}
                {active && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-5 rounded-full bg-gradient-to-b from-primary-500 to-purple-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mb-6">
          <div className="flex items-center justify-between px-3 mb-2">
            {!isCollapsed && <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Cuadernos</span>}
            <div className="flex items-center gap-1">
              <button onClick={() => setShowNotebooks(!showNotebooks)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors">
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showNotebooks ? "" : "-rotate-90"}`} />
              </button>
              {!isCollapsed && (
                <button onClick={() => { setNewNotebookName(""); setShowCreateModal(true); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-400 hover:text-primary-500 transition-all" title="Crear cuaderno">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {showNotebooks && (
            <div className="space-y-0.5">
              {(notebooks || []).map((nb) => (
                <div key={nb._id} className={`group flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isActive(`/dashboard?notebook=${nb._id}`) ? "bg-primary-500/10 dark:bg-primary-500/20" : "hover:bg-gray-50 dark:hover:bg-dark-800"}`}>
                  <Link to={`/dashboard?notebook=${nb._id}`} onClick={handleNavClick} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: nb.color || "#6366f1" }} />
                    {!isCollapsed && <span className="text-sm font-medium truncate text-gray-700 dark:text-dark-300">{nb.title || nb.name}</span>}
                  </Link>
                  {!isCollapsed && (
                    <button onClick={async () => { if(confirm("¿Eliminar este cuaderno?")) { await deleteNotebook(nb._id); } }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all" title="Eliminar cuaderno">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateModal && !isCollapsed && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 w-full max-w-sm animate-scale-in shadow-2xl dark:shadow-dark-950/50 border border-gray-100 dark:border-dark-800" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Nuevo cuaderno</h3>
              <input
                type="text"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                placeholder="Nombre del cuaderno"
                className="input-field w-full mb-4"
                autoFocus
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newNotebookName.trim()) {
                    setCreating(true);
                    await createNotebook({ name: newNotebookName.trim(), color: "#6366f1" });
                    setCreating(false);
                    setShowCreateModal(false);
                  }
                }}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancelar</button>
                <button
                  onClick={async () => {
                    if (!newNotebookName.trim()) return;
                    setCreating(true);
                    await createNotebook({ name: newNotebookName.trim(), color: "#6366f1" });
                    setCreating(false);
                    setShowCreateModal(false);
                  }}
                  disabled={creating || !newNotebookName.trim()}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {creating ? "Creando..." : "Crear"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between px-3 mb-2">
            {!isCollapsed && <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Categorías</span>}
            <button onClick={() => setShowCategories(!showCategories)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors">
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showCategories ? "" : "-rotate-90"}`} />
            </button>
          </div>
          {showCategories && (
            <div className="space-y-0.5">
              {(categories || []).map((cat) => (
                <Link key={cat._id} to={`/dashboard?category=${cat._id}`} onClick={handleNavClick} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isActive(`/dashboard?category=${cat._id}`) ? "bg-primary-500/10 dark:bg-primary-500/20" : "hover:bg-gray-50 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400"}`}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || "#6366f1" }} />
                  {!isCollapsed && <span className="text-sm font-medium truncate text-gray-700 dark:text-dark-300">{cat.name}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="space-y-0.5 pt-4 border-t border-gray-100 dark:border-dark-800">
          {!isCollapsed && <p className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Herramientas</p>}
          {toolsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.id} to={item.path} onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${active
                    ? "bg-gradient-to-r from-primary-500/10 to-purple-500/10 dark:from-primary-500/20 dark:to-purple-500/20 font-semibold text-gray-900 dark:text-gray-100"
                    : "hover:bg-gray-50 dark:hover:bg-dark-800 text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-200 ${active ? "text-primary-500" : "text-gray-400 dark:text-dark-500 group-hover:scale-110"}`} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
                {active && !isCollapsed && (
                  <div className="ml-auto w-1.5 h-5 rounded-full bg-gradient-to-b from-primary-500 to-purple-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-100 dark:border-dark-800">
          <Link to="/dashboard/profile" onClick={handleNavClick} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800 transition-all group">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-500/30 group-hover:ring-primary-500/50 transition-all" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-md ring-2 ring-primary-500/30 group-hover:ring-primary-500/50 transition-all">
                <span className="text-white font-bold text-sm">{user.name?.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400 truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
