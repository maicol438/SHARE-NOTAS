import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Star, Trash2, RotateCcw, X } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const category = searchParams.get("category");
  const notebook = searchParams.get("notebook");

  const {
    notes = [], isLoading, fetchNotes, fetchCategories, categories = [],
    moveToTrash, togglePin, toggleFavorite,
    localSearchNotes, getFilteredNotes,
  } = useNoteStore();

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState("");
  const { trashNotes = [], restoreNote, permanentDelete, fetchTrash } = useNoteStore();

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  const isFavoritesTab = tab === "favorites";
  const isTrashTab = tab === "trash";

  const activeCatName = (categories || [])?.find(c => c._id === category)?.name || "";
  const filteredNotes = getFilteredNotes?.() || [];

  useEffect(() => { 
    if (isTrashTab) fetchTrash();
    else fetchNotes({ q: search });
  }, [isTrashTab, search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { 
    fetchCategories(); 
  }, []);

  const handleCloseModal = () => { setShowModal(false); setEditingNote(null); };
  
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    const result = await moveToTrash(id);
    if (result.ok) toast.success("Nota en papelera");
  };
  
  const handleTogglePin = async (id) => { await togglePin(id); };
  const handleToggleFavorite = async (id) => { await toggleFavorite(id); };
  
  const handleRestore = async (id) => {
    const result = await restoreNote(id);
    if (result.ok) toast.success("Nota restaurada");
  };
  
  const handlePermanentDelete = async (id) => {
    if (!confirm("¿Eliminar permanentemente?")) return;
    const result = await permanentDelete(id);
    if (result.ok) toast.success("Nota eliminada");
  };

  const title = isTrashTab ? "🗑️ Papelera" : isFavoritesTab ? "⭐ Favoritos" : activeCatName || search ? "🔍 Resultados" : "📚 Mis Notas";
  const pinFilter = isFavoritesTab ? (n) => n.isFavorite : (_n) => true;
  const pinnedNotes = filteredNotes.filter(n => n.isPinned && pinFilter(n));
  const regularNotes = filteredNotes.filter(n => !n.isPinned && pinFilter(n));
  const displayedNotes = isTrashTab ? trashNotes : regularNotes;

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
          <h2 className="text-2xl font-bold gradient-text">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isTrashTab ? trashNotes.length : displayedNotes.length} notas
          </p>
        </div>

        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); localSearchNotes(e.target.value); }} 
            placeholder={isTrashTab ? "Buscar en papelera..." : "Buscar notas..."} 
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all" 
          />
        </div>

        {!isTrashTab && (
          <Button icon={Plus} onClick={() => setShowModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            Nueva nota
          </Button>
        )}

        {isTrashTab && (
          <Button icon={RotateCcw} onClick={() => setSearchParams({})} className="btn-secondary">
            Volver
          </Button>
        )}
      </div>

      {/* Loading - Premium Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && displayedNotes.length === 0 && (
        <EmptyState 
          type={isTrashTab ? "trash" : isFavoritesTab ? "favorites" : "notes"}
          onAction={!isTrashTab ? () => setShowModal(true) : undefined}
        />
      )}

      {/* Trash Grid */}
      {!isLoading && isTrashTab && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trashNotes.map((note, i) => (
            <NoteCard key={note._id} note={note} index={i} onEdit={() => {}} onDelete={() => handlePermanentDelete(note._id)} onTogglePin={() => handleRestore(note._id)} />
          ))}
        </div>
      )}

      {/* Pinned Notes */}
      {!isLoading && !isTrashTab && pinnedNotes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Fijadas ({pinnedNotes.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note, i) => (
              <NoteCard key={note._id} note={note} index={i} onEdit={() => { setEditingNote(note); setShowModal(true); }} onDelete={() => handleDelete(note._id)} onTogglePin={() => handleTogglePin(note._id)} onToggleFavorite={() => handleToggleFavorite(note._id)} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes */}
      {!isLoading && !isTrashTab && regularNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-4">Notas ({regularNotes.length})</h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNotes.map((note, i) => (
              <NoteCard key={note._id} note={note} index={i} onEdit={() => { setEditingNote(note); setShowModal(true); }} onDelete={() => handleDelete(note._id)} onTogglePin={() => handleTogglePin(note._id)} onToggleFavorite={() => handleToggleFavorite(note._id)} />
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