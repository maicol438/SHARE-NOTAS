import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import useNoteStore from "../../stores/useNoteStore";
import useAuthStore from "../../stores/useAuthStore";

const navItems = [
  { id: "home", label: "Hogar", icon: Home, path: "/dashboard" },
  { id: "notes", label: "Notas", icon: StickyNote, path: "/dashboard" },
  { id: "favorites", label: "Favoritos", icon: Star, path: "/dashboard?tab=favorites" },
  { id: "trash", label: "Papelera", icon: Trash2, path: "/dashboard?tab=trash" },
  { id: "tasks", label: "Tareas", icon: CheckSquare, path: "/dashboard/tasks" },
  { id: "files", label: "Archivos", icon: FolderOpen, path: "/dashboard/files" },
  { id: "calendar", label: "Calendario", icon: Calendar, path: "/dashboard/calendar" },
  { id: "shared", label: "Compartido", icon: Users, path: "/dashboard/shared" },
];

const toolsItems = [
  { id: "search", label: "Buscar", icon: Search, path: "/dashboard/search" },
  { id: "stats", label: "Estadísticas", icon: BarChart3, path: "/dashboard/stats" },
  { id: "profile", label: "Perfil", icon: User, path: "/dashboard/profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const { categories = [], notebooks = [], fetchCategories, fetchNotebooks, createNotebook, deleteNotebook } = useNoteStore();
  const user = useAuthStore((s) => s.user);

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

  useEffect(() => {
    fetchCategories();
    fetchNotebooks();
  }, []);

  return (
    <aside className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">ShareNotes</span>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          {isCollapsed ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronLeft className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1 mb-6">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-400 uppercase mb-2">Menú</p>}
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.id} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active ? "bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : ""}`} />
                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mb-6">
          <div className="flex items-center justify-between px-3 mb-2">
            {!isCollapsed && <span className="text-xs font-semibold text-gray-400 uppercase">Cuadernos</span>}
            <div className="flex items-center gap-1">
              <button onClick={() => setShowNotebooks(!showNotebooks)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showNotebooks ? "" : "-rotate-90"}`} />
              </button>
              {!isCollapsed && (
                <button onClick={() => { setNewNotebookName(""); setShowCreateModal(true); }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors" title="Crear cuaderno">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {showNotebooks && (
            <div className="space-y-1">
              {(notebooks || []).map((nb) => (
                <div key={nb._id} className={`group flex items-center gap-2 px-3 py-2 rounded-xl ${isActive(`/dashboard?notebook=${nb._id}`) ? "bg-primary-500 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                  <Link to={`/dashboard?notebook=${nb._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: nb.color || "#6366f1" }} />
                    {!isCollapsed && <span className="text-sm truncate">{nb.name}</span>}
                  </Link>
                  {!isCollapsed && (
                    <button onClick={async () => { if(confirm("¿Eliminar este cuaderno?")) { await deleteNotebook(nb._id); } }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-all" title="Eliminar cuaderno">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {showCreateModal && !isCollapsed && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-4">Nuevo cuaderno</h3>
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
          <button onClick={() => setShowCategories(!showCategories)} className="flex items-center justify-between w-full px-3 text-xs font-semibold text-gray-400 uppercase mb-2">
            <span>Categorías</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? "" : "-rotate-90"}`} />
          </button>
          {showCategories && (
            <div className="space-y-1">
              {(categories || []).map((cat) => (
                <Link key={cat._id} to={`/dashboard?category=${cat._id}`} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${isActive(`/dashboard?category=${cat._id}`) ? "bg-primary-500 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600"}`}>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || "#6366f1" }} />
                  {!isCollapsed && <span className="text-sm truncate">{cat.name}</span>}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link to="/dashboard/search" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-6 ${isActive("/dashboard/search") ? "bg-gradient-to-r from-primary-500 to-purple-600 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600"}`}>
          <TagIcon className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">Etiquetas</span>}
        </Link>

        <nav className="space-y-1 pt-4 border-t border-gray-100 dark:border-gray-800">
          {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-400 uppercase mb-2">Herramientas</p>}
          {toolsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.id} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${active ? "bg-gradient-to-r from-primary-500 to-purple-600 text-white" : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600"}`}>
                <Icon className={`w-5 h-5 ${active ? "text-white" : ""}`} />
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Link to="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user.name?.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}