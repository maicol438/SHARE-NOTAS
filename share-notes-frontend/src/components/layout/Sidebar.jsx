import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, Tag, Trash2, StickyNote, LayoutGrid, Globe, User, LogOut, BookOpen } from "lucide-react";
import useNoteStore from "../../stores/useNoteStore.js";
import useAuthStore from "../../stores/useAuthStore.js";
import Modal from "../ui/Modal.jsx";
import CategoryForm from "../categories/CategoryForm.jsx";
import Badge from "../ui/Badge.jsx";
import Tooltip from "../ui/Tooltip.jsx";
import toast from "react-hot-toast";

const Sidebar = ({ isOpen, onClose }) => {
  const { categories, activeCategory, setActiveCategory, deleteCategory, notes } = useNoteStore();
  const { user, logout } = useAuthStore();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const location = useLocation();

  const handleDeleteCategory = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const result = await deleteCategory(id);
    if (!result.ok) toast.error(result.message);
    else toast.success("Categoría eliminada");
  };

  const countByCategory = (catId) => notes.filter((n) => n.category?._id === catId).length;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40 md:z-auto
          w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          flex flex-col transition-transform duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo branding */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">ShareNotes</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tu espacio de estudio</p>
            </div>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-1">
          {/* Todas las notas */}
          <Link
            to="/dashboard"
            onClick={() => { setActiveCategory(null); onClose?.(); }}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left ${
              location.pathname === "/dashboard" && !activeCategory
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "hover:bg-white dark:hover:bg-slate-900 text-gray-600 dark:text-gray-400 hover:shadow-sm"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="flex-1">Mis notas</span>
            <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">{notes.length}</span>
          </Link>

          <Link
            to="/dashboard/explore"
            onClick={() => { onClose?.(); }}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left ${
              location.pathname === "/dashboard/explore"
                ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "hover:bg-white dark:hover:bg-slate-900 text-gray-600 dark:text-gray-400 hover:shadow-sm"
            }`}
          >
            <Globe className="w-5 h-5" />
            <span className="flex-1">Explorar</span>
          </Link>

          {/* Separador */}
          <div className="flex items-center justify-between px-4 py-3 mt-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Categorías
            </span>
            <Tooltip text="Nueva categoría">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          {/* Lista de categorías */}
          <div className="flex flex-col gap-1 overflow-y-auto flex-1">
            {categories.length === 0 && (
              <p className="text-xs text-gray-400 px-4 py-2">Sin categorías aún</p>
            )}
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm cursor-pointer transition-all ${
                  activeCategory === cat._id
                    ? "bg-indigo-100 dark:bg-indigo-900/30"
                    : "hover:bg-white dark:hover:bg-slate-900"
                }`}
                onClick={() => { setActiveCategory(cat._id); onClose?.(); }}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{cat.name}</span>
                <span className="text-xs text-gray-400">{countByCategory(cat._id)}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Profile at Bottom */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-colors cursor-pointer">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-md">
                {user?.name?.charAt(0) || <User className="w-5 h-5" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Nueva categoría"
        size="sm"
      >
        <CategoryForm onClose={() => setShowCategoryModal(false)} />
      </Modal>
    </>
  );
};

export default Sidebar;
