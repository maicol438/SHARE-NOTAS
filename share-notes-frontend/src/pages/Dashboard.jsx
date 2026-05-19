import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, Star, Trash2, RotateCcw, X, FileText, TrendingUp, Clock, CheckSquare, Sparkles, Pin, Zap } from "lucide-react";
import useNoteStore from "../stores/useNoteStore.js";
import useAuthStore from "../stores/useAuthStore.js";
import NoteCard from "../components/notes/NoteCard.jsx";
import NoteForm from "../components/notes/NoteForm.jsx";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { showToast } from "../utils/toast.jsx";
import api from "../api/axios.js";

const StatCard = ({ icon: Icon, label, value, gradient, delay = 0 }) => (
  <div className="card p-5 flex items-center gap-4 animate-slide-up group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-default"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}>
    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl p-6 flex flex-col gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
    <div className="h-6 bg-gray-200 dark:bg-dark-700 rounded w-3/4 animate-pulse" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded animate-pulse" />
      <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded w-5/6 animate-pulse" />
      <div className="h-4 bg-gray-100 dark:bg-dark-800 rounded w-4/6 animate-pulse" />
    </div>
    <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-dark-800 mt-auto">
      <div className="h-6 w-24 bg-gray-200 dark:bg-dark-700 rounded-full animate-pulse" />
      <div className="h-4 w-16 bg-gray-100 dark:bg-dark-800 rounded animate-pulse" />
    </div>
  </div>
);

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get("tab");
  const category = searchParams.get("category");
  const notebook = searchParams.get("notebook");

  const {
    notes = [], fetchNotes, fetchCategories, categories = [],
    moveToTrash, togglePin, toggleFavorite,
    localSearchNotes, getFilteredNotes, setFavoriteFilter, isLoading,
  } = useNoteStore();

  const [showSkeleton, setShowSkeleton] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => setShowSkeleton(true), 400);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowSkeleton(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isLoading]);

  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [search, setSearch] = useState("");
  const { trashNotes = [], restoreNote, permanentDelete, fetchTrash } = useNoteStore();
  const user = useAuthStore((s) => s.user);

  const [showWelcome, setShowWelcome] = useState(true);
  const [stats, setStats] = useState(null);

  const isFavoritesTab = tab === "favorites";
  const isTrashTab = tab === "trash";

  const activeCatName = useMemo(() => (categories || [])?.find(c => c._id === category)?.name || "", [categories, category]);
  const filteredNotes = getFilteredNotes?.() || [];

  useEffect(() => {
    setFavoriteFilter(isFavoritesTab);
  }, [isFavoritesTab, setFavoriteFilter]);

  useEffect(() => {
    const load = async () => {
      if (isTrashTab) {
        const result = await fetchTrash();
        if (!result.ok) showToast(result.message || "Error al cargar papelera", "error");
      } else {
        const result = await fetchNotes({});
        if (!result.ok) showToast(result.message || "Error al cargar notas", "error");
      }
    };
    load();
  }, [isTrashTab, fetchNotes, fetchTrash]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    api.get("/stats").then(res => setStats(res.data)).catch(() => {});
  }, [notes.length]);

  const loadNotesCount = useMemo(() => notes?.length || 0, [notes]);
  const completedTasks = stats?.tasks?.completed || 0;
  const totalTasks = stats?.tasks?.total || 0;
  const totalFavorites = useMemo(() => notes?.filter(n => n.isFavorite)?.length || 0, [notes]);

  const handleCloseModal = useCallback(() => { setShowModal(false); setEditingNote(null); }, []);

  const handleDelete = useCallback(async (id) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    const result = await moveToTrash(id);
    if (result.ok) showToast("Nota movida a papelera", "success");
  }, [moveToTrash]);

  const handleTogglePin = useCallback(async (id) => { await togglePin(id); }, [togglePin]);
  const handleToggleFavorite = useCallback(async (id) => { await toggleFavorite(id); }, [toggleFavorite]);

  const handleRestore = useCallback(async (id) => {
    const result = await restoreNote(id);
    if (result.ok) showToast("Nota restaurada", "success");
  }, [restoreNote]);

  const handlePermanentDelete = useCallback(async (id) => {
    if (!confirm("¿Eliminar permanentemente?")) return;
    const result = await permanentDelete(id);
    if (result.ok) showToast("Nota eliminada permanentemente", "error");
  }, [permanentDelete]);

  const title = isTrashTab ? "Papelera" : isFavoritesTab ? "Favoritos" : activeCatName || search ? "Resultados" : "Mis Notas";
  const pinFilter = isFavoritesTab ? (n) => n.isFavorite : (_n) => true;
  const pinnedNotes = useMemo(() => filteredNotes.filter(n => n.isPinned && pinFilter(n)), [filteredNotes, pinFilter]);
  const regularNotes = useMemo(() => filteredNotes.filter(n => !n.isPinned && pinFilter(n)), [filteredNotes, pinFilter]);
  const displayedNotes = isTrashTab ? trashNotes : regularNotes;

  return (
    <div className="max-w-6xl mx-auto">
      {showWelcome && notes.length === 0 && !isLoading && (
        <div className="mb-8 p-5 sm:p-8 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-3xl text-white relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                <span className="text-sm font-semibold text-white/80">¡Bienvenido!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Hola, {user?.name?.split(" ")[0]} 👋</h2>
              <p className="text-white/80 text-sm sm:text-lg">Crea tu primera nota y empieza a organizar tus estudios.</p>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl">
                  <Zap className="w-5 h-5" />
                  Crear primera nota
                </button>
                <button onClick={() => navigate("/dashboard/explore")} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/10">
                  Explorar
                </button>
              </div>
            </div>
            <button onClick={() => setShowWelcome(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {(!isTrashTab || (isTrashTab && trashNotes.length === 0)) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Total notas" value={loadNotesCount} gradient="from-primary-500 to-purple-600" delay={0} />
          <StatCard icon={Star} label="Favoritos" value={totalFavorites} gradient="from-yellow-500 to-amber-600" delay={100} />
          <StatCard icon={CheckSquare} label={`Tareas (${completedTasks}/${totalTasks})`} value={completedTasks} gradient="from-emerald-500 to-green-600" delay={200} />
          <StatCard icon={TrendingUp} label="Categorías" value={categories?.length || 0} gradient="from-blue-500 to-cyan-600" delay={300} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div className="flex-1 animate-fade-in min-w-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold gradient-text truncate">{title}</h2>
            {!isTrashTab && !isFavoritesTab && (
              <span className="px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full flex-shrink-0">
                {displayedNotes.length}
              </span>
            )}
          </div>
          {!isTrashTab && !isFavoritesTab && notes.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {pinnedNotes.length > 0 && `${pinnedNotes.length} fijadas · `}
              {regularNotes.length} notas
            </p>
          )}
          {isTrashTab && <p className="text-sm text-gray-500 mt-0.5">{trashNotes.length} notas en papelera</p>}
          {isFavoritesTab && <p className="text-sm text-gray-500 mt-0.5">{displayedNotes.length} notas favoritas</p>}
        </div>

        <div className="relative flex-1 sm:max-w-md animate-fade-in delay-100 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); localSearchNotes(e.target.value); }}
            placeholder={isTrashTab ? "Buscar en papelera..." : "Buscar notas..."}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-dark-850/50 border border-gray-200 dark:border-dark-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all hover:border-gray-300 dark:hover:border-dark-600 group-focus-within:shadow-lg group-focus-within:shadow-primary-500/5"
          />
        </div>

        <div className="flex gap-2 sm:block">
          {!isTrashTab && (
            <Button icon={Plus} onClick={() => setShowModal(true)} className="animate-fade-in delay-200 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white border-none shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all hover:scale-105 w-full sm:w-auto">
              Nueva nota
            </Button>
          )}

          {isTrashTab && (
            <Button icon={RotateCcw} onClick={() => setSearchParams({})} className="btn-secondary animate-fade-in delay-200 w-full sm:w-auto">
              Volver
            </Button>
          )}
        </div>
      </div>

      {showSkeleton && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!showSkeleton && displayedNotes.length === 0 && !isTrashTab && (
        <EmptyState
          type={isFavoritesTab ? "favorites" : "notes"}
          onAction={!isTrashTab ? () => setShowModal(true) : undefined}
        />
      )}

      {!showSkeleton && displayedNotes.length === 0 && isTrashTab && (
        <EmptyState type="trash" />
      )}

      {!showSkeleton && isTrashTab && trashNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trashNotes.map((note, i) => (
            <NoteCard key={note._id} note={note} index={i} onEdit={() => {}} onDelete={() => handlePermanentDelete(note._id)} onTogglePin={() => handleRestore(note._id)} />
          ))}
        </div>
      )}

      {!showSkeleton && !isTrashTab && pinnedNotes.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-primary-500 to-purple-500" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-primary-500" />
              Fijadas
            </h3>
            <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-full">{pinnedNotes.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedNotes.map((note, i) => (
              <NoteCard key={note._id} note={note} index={i} onEdit={() => { setEditingNote(note); setShowModal(true); }} onDelete={() => handleDelete(note._id)} onTogglePin={() => handleTogglePin(note._id)} onToggleFavorite={() => handleToggleFavorite(note._id)} />
            ))}
          </div>
        </div>
      )}

      {!showSkeleton && !isTrashTab && regularNotes.length > 0 && (
        <div className="animate-fade-in">
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-2 mb-4 px-1">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gray-300 to-gray-400 dark:from-dark-600 dark:to-dark-500" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Todas las notas
              </h3>
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-dark-400 text-[10px] font-bold rounded-full">{regularNotes.length}</span>
            </div>
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
