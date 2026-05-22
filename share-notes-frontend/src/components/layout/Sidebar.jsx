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

  useEffect(() => {
    fetchCategories();
    fetchNotebooks();
  }, []);

  const NavLink = ({ item, compact }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        to={item.path}
        onClick={handleClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative
          ${active
            ? "bg-primary-500/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 font-bold border border-primary-500/20 dark:border-primary-500/10 shadow-sm"
            : "text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-100 hover:bg-gray-200/40 dark:hover:bg-dark-800/40 border border-transparent"
          }`}
      >
        <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${active ? "text-primary-500 dark:text-primary-400" : "text-gray-400 dark:text-dark-500 group-hover:text-primary-500"}`} />
        {!compact && <span className="text-sm tracking-wide">{item.label}</span>}
        {active && !compact && (
          <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 shadow-lg shadow-primary-500" />
        )}
      </Link>
    );
  };

  const SectionToggle = ({ label, open, onToggle, onAdd }) => (
    <div className="flex items-center justify-between px-3 mb-2 mt-4 first:mt-0">
      <span className="text-[10px] font-bold text-gray-400 dark:text-dark-500 uppercase tracking-[0.15em]">{label}</span>
      <div className="flex items-center gap-0.5">
        {onAdd && (
          <button
            onClick={onAdd}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800/60 text-gray-400 dark:text-dark-500 hover:text-primary-500 dark:hover:text-primary-400 transition-all"
            title="Añadir"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800/60 text-gray-400 dark:text-dark-500 hover:text-gray-600 dark:hover:text-dark-300 transition-all"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "" : "-rotate-90"}`} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl border-r border-gray-200/50 dark:border-white/[0.06] transition-all duration-300 ease-tesla relative z-20 shadow-xl shadow-gray-200/[0.04] dark:shadow-black/[0.08] ${
          collapsed ? "w-[76px]" : "w-[240px]"
        }`}
      >
        {/* Header/Logo */}
        <div className={`flex items-center border-b border-gray-200/40 dark:border-white/[0.04] ${collapsed ? "justify-center p-4" : "justify-between px-5 py-4.5"}`}>
          {!collapsed && (
            <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg opacity-40 blur-sm group-hover:opacity-75 transition-all duration-300" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/20">
                  <StickyNote className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="font-bold text-sm tracking-wide text-gray-800 dark:text-dark-100 group-hover:text-primary-500 transition-colors">
                ShareNotes
              </span>
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl hover:bg-gray-200/50 dark:hover:bg-dark-800 text-gray-400 dark:text-dark-500 hover:text-gray-800 dark:hover:text-dark-100 transition-all border border-transparent dark:hover:border-white/[0.04]"
          >
            {collapsed ? <PanelLeft className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin space-y-6">
          {/* Quick note button */}
          {!collapsed && (
            <button
              onClick={() => {
                handleClick();
                navigate("/dashboard");
              }}
              className="flex items-center justify-center gap-2.5 w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva nota</span>
            </button>
          )}

          {/* Main nav */}
          <nav className="space-y-1">
            {!collapsed && <SectionToggle label="General" open={true} />}
            {navItems.map((item) => (
              <NavLink key={item.id} item={item} compact={collapsed} />
            ))}
          </nav>

          {/* Notebooks */}
          <div>
            {!collapsed && (
              <SectionToggle
                label="Cuadernos"
                open={notebooksOpen}
                onToggle={() => setNotebooksOpen(!notebooksOpen)}
                onAdd={() => {
                  setNewNotebookName("");
                  setShowCreateModal(true);
                }}
              />
            )}
            {notebooksOpen && (
              <div className="space-y-1">
                {(notebooks || []).map((nb) => {
                  const active = isActive(`/dashboard?notebook=${nb._id}`);
                  return (
                    <div
                      key={nb._id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl transition-all border
                        ${active
                          ? "bg-primary-500/10 dark:bg-primary-500/15 border-primary-500/20 dark:border-primary-500/10 text-primary-600 dark:text-primary-400 font-bold"
                          : "hover:bg-gray-200/40 dark:hover:bg-dark-800/40 text-gray-500 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-100 border-transparent"
                        }`}
                    >
                      <Link to={`/dashboard?notebook=${nb._id}`} onClick={handleClick} className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm transition-transform group-hover:scale-110"
                          style={{ backgroundColor: nb.color || "#6c63ff" }}
                        />
                        {!collapsed && <span className="text-sm truncate leading-none">{nb.title || nb.name}</span>}
                      </Link>
                      {!collapsed && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await deleteNotebook(nb._id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/10"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            {!collapsed && (
              <SectionToggle label="Categorías" open={categoriesOpen} onToggle={() => setCategoriesOpen(!categoriesOpen)} />
            )}
            {categoriesOpen && (
              <div className="space-y-1">
                {(categories || []).map((cat) => (
                  <NavLink
                    key={cat._id}
                    compact={collapsed}
                    item={{
                      id: cat._id,
                      label: cat.name,
                      icon: () => (
                        <div
                          className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-110"
                          style={{ backgroundColor: cat.color || "#6c63ff" }}
                        />
                      ),
                      path: `/dashboard?category=${cat._id}`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* More */}
          <nav className="space-y-1">
            {!collapsed && <SectionToggle label="Más" open={true} />}
            {moreItems.map((item) => (
              <NavLink key={item.id} item={item} compact={collapsed} />
            ))}
            {isAdmin && (
              <NavLink
                item={{ id: "admin", label: "Admin Panel", icon: Shield, path: "/dashboard/admin" }}
                compact={collapsed}
              />
            )}
          </nav>
        </div>

        {/* User Card at bottom */}
        {user && !collapsed && (
          <div className="p-3 border-t border-gray-200/40 dark:border-white/[0.04]">
            <Link
              to="/dashboard/profile"
              onClick={handleClick}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-850/60 transition-all group border border-transparent hover:border-gray-200 dark:hover:border-white/[0.04]"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8.5 h-8.5 rounded-full object-cover ring-2 ring-primary-500/20 group-hover:ring-primary-500/40 transition-all duration-300"
                />
              ) : (
                <div className="w-8.5 h-8.5 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center ring-2 ring-primary-500/10 group-hover:ring-primary-500/30 transition-all duration-300">
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-sm uppercase">
                    {user.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-dark-200 truncate group-hover:text-primary-500 transition-colors leading-snug">
                  {user.name}
                </p>
                <p className="text-2xs text-gray-400 dark:text-dark-500 truncate leading-none mt-0.5">{user.email}</p>
              </div>
            </Link>
          </div>
        )}

        {user && collapsed && (
          <div className="p-3 border-t border-gray-200/40 dark:border-white/[0.04] flex justify-center">
            <Link
              to="/dashboard/profile"
              onClick={handleClick}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-850/60 transition-all duration-300"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-8.5 h-8.5 rounded-full object-cover ring-2 ring-primary-500/10 hover:ring-primary-500/40 transition-all"
                />
              ) : (
                <div className="w-8.5 h-8.5 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center ring-2 ring-primary-500/10 hover:ring-primary-500/30 transition-all">
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-sm uppercase">
                    {user.name?.charAt(0)}
                  </span>
                </div>
              )}
            </Link>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-900/90 backdrop-blur-2xl border-t border-gray-200/50 dark:border-white/[0.06] safe-area-bottom shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleClick}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0
                  ${
                    active
                      ? "text-primary-500 dark:text-primary-400 bg-primary-500/5 font-bold"
                      : "text-gray-400 dark:text-dark-500 hover:text-gray-800 dark:hover:text-dark-200"
                  }`}
              >
                <Icon className="w-5 h-5 transition-transform active:scale-90" />
                <span className="text-[9px] tracking-wide font-semibold leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white dark:bg-dark-900 border border-gray-300/20 dark:border-white/[0.06] rounded-3xl p-6.5 w-full max-w-sm animate-scale-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-extrabold text-lg text-gray-800 dark:text-dark-100 mb-4 tracking-wide">Nuevo cuaderno</h3>
            <input
              type="text"
              value={newNotebookName}
              onChange={(e) => setNewNotebookName(e.target.value)}
              placeholder="Nombre del cuaderno"
              className="input-field w-full mb-5 font-medium"
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === "Enter" && newNotebookName.trim()) {
                  await createNotebook({ name: newNotebookName.trim(), color: "#6c63ff" });
                  setShowCreateModal(false);
                }
              }}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1 font-bold">
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (!newNotebookName.trim()) return;
                  await createNotebook({ name: newNotebookName.trim(), color: "#6c63ff" });
                  setShowCreateModal(false);
                }}
                disabled={!newNotebookName.trim()}
                className="btn-primary flex-1 font-bold"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
