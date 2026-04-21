import { useEffect, useState } from "react";
import { Plus, Search, StickyNote, Star, Trash2, RotateCcw, Sparkles, ArrowRight, X } from "lucide-react";
import useNoteStore from "../stores/useNoteStore.js";
import NoteCard from "../components/notes/NoteCard.jsx";
import NoteForm from "../components/notes/NoteForm.jsx";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import toast from "react-hot-toast";

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6 animate-pulse" />
      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/6 animate-pulse" />
    </div>
    <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
      <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    </div>
  </div>
);

const Dashboard = () => {
  const {
    notes, isLoading, fetchNotes, fetchCategories,
    moveToTrash, togglePin, toggleFavorite,
    activeCategory, setSearchQuery,
    favoriteFilter, setFavoriteFilter,
    categories, localSearchNotes, getFilteredNotes,
  } = useNoteStore();

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [search, setSearch] = useState("");
  const { trashNotes, restoreNote, permanentDelete, fetchTrash } = useNoteStore();

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  const activeCatName = categories.find(c => c._id === activeCategory)?.name || "";
  const filteredNotes = getFilteredNotes();

  useEffect(() => { 
    fetchCategories(); 
    fetchNotes({});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (showTrash) fetchTrash();
  }, [showTrash]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    localSearchNotes(value);
  };

  const handleEdit = (note) => { setEditingNote(note); setShowModal(true); };
  const handleCloseModal = () => { setShowModal(false); setEditingNote(null); };
  
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta nota?\nSe enviará a la papelera.")) return;
    const result = await moveToTrash(id);
    if (result.ok) toast.success("📦 Nota movida a la papelera"); else toast.error(result.message);
  };
  
  const handleTogglePin = async (id) => { await togglePin(id); };
  const handleToggleFavorite = async (id) => { await toggleFavorite(id); };
  
  const handleRestore = async (id) => {
    const result = await restoreNote(id);
    if (result.ok) toast.success("✅ Nota restaurada");
  };
  
  const handlePermanentDelete = async (id) => {
    if (!confirm("¿Eliminar permanentemente?\nEsta acción no se puede deshacer.")) return;
    const result = await permanentDelete(id);
    if (result.ok) toast.success("🗑️ Nota eliminada permanentemente");
  };

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const regularNotes = filteredNotes.filter((n) => !n.isPinned);

  

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome banner for new users */}
      {showWelcome && notes.length === 0 && !isLoading && (
        <div className="mb-8 p-6 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl text-white animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">👋 ¡Bienvenido a ShareNotes!</h2>
              <p className="text-primary-100">Crea tu primera nota para comenzar a organizar tus estudios.</p>
              <Button icon={Plus} onClick={() => setShowModal(true)} className="mt-4 bg-white text-primary-600 hover:bg-gray-100">
                Crear primera nota
              </Button>
            </div>
            <button onClick={() => setShowWelcome(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold gradient-text">
            {showTrash ? "🗑️ Papelera" : activeCategory ? activeCatName : search ? "🔍 Resultados" : favoriteFilter ? "⭐ Favoritos" : "📚 Mis Notas"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {showTrash ? trashNotes.length : filteredNotes.length} {showTrash ? "notas" : "notas"}{!showTrash && search && ` (filtrados)`}
          </p>
        </div>

        {/* Search - Premium */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={search} 
            onChange={handleSearch} 
            placeholder={showTrash ? "Buscar en papelera..." : "Buscar notas..."} 
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all shadow-sm" 
          />
        </div>

        {/* Actions */}
        {!showTrash && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFavoriteFilter(!favoriteFilter)} 
              className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${favoriteFilter ? "text-yellow-500 bg-yellow-50" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <Star className={`w-5 h-5 ${favoriteFilter ? "fill-current" : ""}`} />
            </button>
            <button 
              onClick={() => setShowTrash(true)} 
              className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-all duration-300 hover:scale-110"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {showTrash && (
          <button 
            onClick={() => setShowTrash(false)} 
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-all duration-300 hover:scale-110"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {!showTrash && (
          <Button icon={Plus} onClick={() => setShowModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-white">
            Nueva nota
          </Button>
        )}
      </div>

      {/* Loading - Premium Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state - Premium */}
      {!isLoading && filteredNotes.length === 0 && (
        <EmptyState 
          type={showTrash ? "trash" : search ? "search" : favoriteFilter ? "favorites" : activeCategory ? "category" : "notes"}
          title={search ? `No encontramos "${search}"` : undefined}
          subtitle={search ? "Intenta con otras palabras" : undefined}
          onAction={!showTrash && !search && !favoriteFilter ? () => setShowModal(true) : undefined}
        />
      )}

      {/* Trash - Premium Grid */}
      {!isLoading && showTrash && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trashNotes.map((note, i) => (
            <NoteCard key={note._id} note={note} index={i} external onEdit={() => {}} onDelete={() => handlePermanentDelete(note._id)} onTogglePin={() => handleRestore(note._id)} />
          ))}
        </div>
      )}

      {/* Pinned notes - Premium */}
      {!isLoading && !showTrash && pinnedNotes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" /> Fijadas <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full text-xs font-medium">{pinnedNotes.length}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note, i) => (
              <NoteCard key={note._id} note={note} index={i} onEdit={handleEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        </div>
      )}

      {/* Regular notes - Premium */}
      {!isLoading && !showTrash && regularNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full" /> Notas <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-medium">{regularNotes.length}</span>
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNotes.map((note, i) => (
              <NoteCard key={note._id} note={note} index={i} onEdit={handleEdit} onDelete={handleDelete} onTogglePin={handleTogglePin} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingNote ? "Editar nota" : "Nueva nota"} size="lg">
        <NoteForm note={editingNote} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Dashboard;