import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  CheckSquare,
  FolderOpen,
  Calendar,
  Search,
  BarChart3,
  User,
  ChevronDown,
  Plus,
  Star,
  Trash2,
  Users,
  Trash,
  Shield,
  StickyNote,
  FileText,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import useNoteStore from "../../stores/useNoteStore";
import useAuthStore from "../../stores/useAuthStore";

const navItems = [
  { id: "home", label: "Mis Notas", icon: StickyNote, path: "/dashboard" },
  { id: "favorites", label: "Favoritos", icon: Star, path: "/dashboard?tab=favorites" },
  { id: "tasks", label: "Tareas", icon: CheckSquare, path: "/dashboard/tasks" },
  { id: "calendar", label: "Calendario", icon: Calendar, path: "/dashboard/calendar" },
];

const moreItems = [
  { id: "files", label: "Archivos", icon: FolderOpen, path: "/dashboard/files" },
  { id: "shared", label: "Compartido", icon: Users, path: "/dashboard/shared" },
  { id: "search", label: "Buscar", icon: Search, path: "/dashboard/search" },
  { id: "stats", label: "Estadísticas", icon: BarChart3, path: "/dashboard/stats" },
  { id: "trash", label: "Papelera", icon: Trash2, path: "/dashboard?tab=trash" },
];

const mobileNavItems = [
  { id: "home", label: "Notas", icon: StickyNote, path: "/dashboard" },
  { id: "search", label: "Buscar", icon: Search, path: "/dashboard/search" },
  { id: "tasks", label: "Tareas", icon: CheckSquare, path: "/dashboard/tasks" },
  { id: "profile", label: "Perfil", icon: User, path: "/dashboard/profile" },
];

export default function Sidebar({ onNavClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories = [], notebooks = [], fetchCategories, fetchNotebooks, createNotebook, deleteNotebook } = useNoteStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");

  const isActive = (path) => {
    if (path.startsWith("/dashboard?")) return location.search.includes(path.split("?")[1]);
    if (path === "/dashboard") return location.pathname === "/dashboard" && !location.search;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleClick = () => onNavClick?.();

  useEffect(() => { fetchCategories(); fetchNotebooks(); }, []);

  const NavLink = ({ item, compact }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link to={item.path} onClick={handleClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group
          ${active
            ? "bg-primary-500/10 text-primary-300 font-medium"
            : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50"
          }`}
      >
        <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${active ? "text-primary-400" : "text-surface-500 group-hover:text-surface-300"}`} />
        {!compact && <span className="text-sm">{item.label}</span>}
        {active && !compact && <div className="ml-auto w-1 h-4 rounded-full bg-primary-500" />}
      </Link>
    );
  };

  const SectionToggle = ({ label, open, onToggle, onAdd }) => (
    <div className="flex items-center justify-between px-3 mb-1.5">
      <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-[0.12em]">{label}</span>
      <div className="flex items-center gap-0.5">
        {onAdd && (
          <button onClick={onAdd} className="p-1 rounded-md hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-all">
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={onToggle} className="p-1 rounded-md hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-all">
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col h-full bg-surface-950 border-r border-surface-800/60 transition-all duration-300 relative z-20 ${collapsed ? "w-[68px]" : "w-56"}`}>
        <div className={`flex items-center border-b border-surface-800/60 ${collapsed ? "justify-center p-3" : "justify-between px-4 py-3"}`}>
          {!collapsed && (
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
                <StickyNote className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-surface-200 group-hover:text-white transition-colors">ShareNotes</span>
            </button>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-all">
            {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin space-y-6">
          {/* Quick note button */}
          {!collapsed && (
            <button onClick={() => { handleClick(); navigate("/dashboard"); }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 bg-primary-500/10 hover:bg-primary-500/15 text-primary-300 rounded-lg text-sm font-medium transition-all duration-200 border border-primary-500/10 hover:border-primary-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva nota</span>
            </button>
          )}

          {/* Main nav */}
          <nav className="space-y-0.5">
            {!collapsed && <SectionToggle label="General" open={true} />}
            {navItems.map((item) => <NavLink key={item.id} item={item} compact={collapsed} />)}
          </nav>

          {/* Notebooks */}
          <div>
            {!collapsed && (
              <SectionToggle
                label="Cuadernos"
                open={notebooksOpen}
                onToggle={() => setNotebooksOpen(!notebooksOpen)}
                onAdd={() => { setNewNotebookName(""); setShowCreateModal(true); }}
              />
            )}
            {notebooksOpen && (
              <div className="space-y-0.5">
                {(notebooks || []).map((nb) => (
                  <div key={nb._id}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
                      ${isActive(`/dashboard?notebook=${nb._id}`) ? "bg-surface-800" : "hover:bg-surface-800/50"}`}
                  >
                    <Link to={`/dashboard?notebook=${nb._id}`} onClick={handleClick} className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: nb.color || "#6c63ff" }} />
                      {!collapsed && <span className="text-sm text-surface-300 truncate">{nb.title || nb.name}</span>}
                    </Link>
                    {!collapsed && (
                      <button onClick={async () => { await deleteNotebook(nb._id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-surface-500 hover:text-red-400 transition-all">
                        <Trash className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            {!collapsed && (
              <SectionToggle label="Categorías" open={categoriesOpen} onToggle={() => setCategoriesOpen(!categoriesOpen)} />
            )}
            {categoriesOpen && (
              <div className="space-y-0.5">
                {(categories || []).map((cat) => (
                  <NavLink key={cat._id} compact={collapsed}
                    item={{
                      id: cat._id,
                      label: cat.name,
                      icon: () => <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color || "#6c63ff" }} />,
                      path: `/dashboard?category=${cat._id}`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* More */}
          <nav className="space-y-0.5">
            {!collapsed && <SectionToggle label="Más" open={true} />}
            {moreItems.map((item) => <NavLink key={item.id} item={item} compact={collapsed} />)}
            {isAdmin && <NavLink item={{ id: "admin", label: "Admin", icon: Shield, path: "/dashboard/admin" }} compact={collapsed} />}
          </nav>
        </div>

        {/* User */}
        {user && !collapsed && (
          <div className="p-2 border-t border-surface-800/60">
            <Link to="/dashboard/profile" onClick={handleClick}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-800/50 transition-all group">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover ring-1 ring-surface-700" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center ring-1 ring-primary-500/30">
                  <span className="text-primary-300 font-semibold text-xs">{user.name?.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-surface-200 truncate">{user.name}</p>
                <p className="text-[10px] text-surface-500 truncate">{user.email}</p>
              </div>
            </Link>
          </div>
        )}

        {user && collapsed && (
          <div className="p-2 border-t border-surface-800/60 flex justify-center">
            <Link to="/dashboard/profile" onClick={handleClick}>
              {user.avatar ? (
                <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-7 h-7 rounded-full ring-1 ring-surface-700" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center ring-1 ring-primary-500/30">
                  <span className="text-primary-300 font-semibold text-xs">{user.name?.charAt(0)}</span>
                </div>
              )}
            </Link>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-900/95 backdrop-blur-xl border-t border-surface-800/60 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.id} to={item.path} onClick={handleClick}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-0
                  ${active ? "text-primary-400" : "text-surface-500 hover:text-surface-300"}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-surface-900 rounded-xl p-6 w-full max-w-sm animate-scale-in border border-surface-700" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-base text-surface-100 mb-4">Nuevo cuaderno</h3>
            <input type="text" value={newNotebookName} onChange={(e) => setNewNotebookName(e.target.value)}
              placeholder="Nombre del cuaderno" className="input-field w-full mb-4" autoFocus
              onKeyDown={async (e) => {
                if (e.key === "Enter" && newNotebookName.trim()) {
                  await createNotebook({ name: newNotebookName.trim(), color: "#6c63ff" });
                  setShowCreateModal(false);
                }
              }}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={async () => {
                if (!newNotebookName.trim()) return;
                await createNotebook({ name: newNotebookName.trim(), color: "#6c63ff" });
                setShowCreateModal(false);
              }} disabled={!newNotebookName.trim()} className="btn-primary flex-1">Crear</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
