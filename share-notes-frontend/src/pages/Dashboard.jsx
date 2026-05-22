import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, Search, Star, RotateCcw, X, FileText, TrendingUp, CheckSquare, Sparkles, Pin, Zap } from "lucide-react";
import useNoteStore from "../stores/useNoteStore.js";
import useAuthStore from "../stores/useAuthStore.js";
import NoteCard from "../components/notes/NoteCard.jsx";
import NoteForm from "../components/notes/NoteForm.jsx";
import Modal from "../components/ui/Modal.jsx";
import Button from "../components/ui/Button.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { showToast } from "../utils/toast.jsx";
import api from "../api/axios.js";

const StatCard = ({ icon: Icon, label, value, delay = 0 }) => (
  <div className="bg-surface-900 border border-surface-800/60 rounded-xl p-4 flex items-center gap-3 animate-slide-up hover:border-surface-700/60 hover:bg-surface-850 transition-all duration-300 cursor-default"
    style={{ animationDelay: `${delay}ms` }}>
    <div className="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-primary-400" />
    </div>
    <div className="min-w-0">
      <p className="text-lg font-bold text-surface-100 tabular-nums leading-none mb-0.5">{value}</p>
      <p className="text-xs text-surface-500 font-medium truncate">{label}</p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-surface-900 border border-surface-800/60 rounded-xl p-5 flex flex-col gap-3 animate-fade-in-fast">
    <div className="h-5 bg-surface-800 rounded w-3/4 animate-pulse" />
    <div className="space-y-2">
      <div className="h-3 bg-surface-800/50 rounded animate-pulse" />
      <div className="h-3 bg-surface-800/50 rounded w-5/6 animate-pulse" />
    </div>
    <div className="flex gap-2 pt-3 border-t border-surface-800/60 mt-auto">
      <div className="h-5 w-16 bg-surface-800 rounded animate-pulse" />
      <div className="h-5 w-12 bg-surface-800 rounded animate-pulse" />
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
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {showWelcome && notes.length === 0 && !isLoading && (
        <div className="mb-6 p-6 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl text-white relative overflow-hidden animate-scale-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary-200" />
                <span className="text-xs font-semibold text-primary-200">¡Bienvenido!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Hola, {user?.name?.split(" ")[0]}</h2>
              <p className="text-primary-200 text-sm">Crea tu primera nota y empieza a organizar tus estudios.</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary-700 font-semibold rounded-lg text-sm hover:bg-primary-50 transition-all shadow-lg">
                  <Zap className="w-4 h-4" />
                  Crear nota
                </button>
                <button onClick={() => navigate("/dashboard/explore")} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium rounded-lg text-sm hover:bg-white/20 transition-all">
                  Explorar
                </button>
              </div>
            </div>
            <button onClick={() => setShowWelcome(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-all flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {(!isTrashTab || (isTrashTab && trashNotes.length === 0)) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard icon={FileText} label="Total notas" value={loadNotesCount} delay={0} />
          <StatCard icon={Star} label="Favoritos" value={totalFavorites} delay={100} />
          <StatCard icon={CheckSquare} label={`Tareas (${completedTasks}/${totalTasks})`} value={completedTasks} delay={200} />
          <StatCard icon={TrendingUp} label="Categorías" value={categories?.length || 0} delay={300} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-surface-100 truncate">{title}</h1>
            {!isTrashTab && !isFavoritesTab && (
              <span className="px-2 py-0.5 bg-surface-800 text-surface-400 text-xs font-medium rounded-md">{displayedNotes.length}</span>
            )}
          </div>
          {!isTrashTab && !isFavoritesTab && notes.length > 0 && (
            <p className="text-xs text-surface-500 mt-0.5">
              {pinnedNotes.length > 0 && `${pinnedNotes.length} fijadas · `}{regularNotes.length} notas
            </p>
          )}
          {isTrashTab && <p className="text-xs text-surface-500 mt-0.5">{trashNotes.length} notas en papelera</p>}
          {isFavoritesTab && <p className="text-xs text-surface-500 mt-0.5">{displayedNotes.length} notas favoritas</p>}
        </div>

        <div className="relative flex-1 sm:max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); localSearchNotes(e.target.value); }}
            placeholder={isTrashTab ? "Buscar en papelera..." : "Buscar notas..."}
            className="w-full pl-10 pr-3 py-2 bg-surface-850 border border-surface-700 rounded-lg text-sm text-surface-200 placeholder-surface-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {!isTrashTab && (
            <Button icon={Plus} onClick={() => setShowModal(true)} className="w-full sm:w-auto">Nueva nota</Button>
          )}
          {isTrashTab && (
            <Button variant="secondary" icon={RotateCcw} onClick={() => setSearchParams({})} className="w-full sm:w-auto">Volver</Button>
          )}
        </div>
      </div>

      {showSkeleton && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!showSkeleton && displayedNotes.length === 0 && !isTrashTab && (
        <EmptyState type={isFavoritesTab ? "favorites" : "notes"} onAction={!isTrashTab ? () => setShowModal(true) : undefined} />
      )}

      {!showSkeleton && displayedNotes.length === 0 && isTrashTab && <EmptyState type="trash" />}

      {!showSkeleton && isTrashTab && trashNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trashNotes.map((note, i) => (
            <NoteCard key={note._id} note={note} index={i} onEdit={() => {}} onDelete={() => handlePermanentDelete(note._id)} onTogglePin={() => handleRestore(note._id)} />
          ))}
        </div>
      )}

      {!showSkeleton && !isTrashTab && pinnedNotes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Fijadas</span>
            <span className="px-1.5 py-0.5 bg-surface-800 text-surface-400 text-2xs font-medium rounded">{pinnedNotes.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note, i) => (
              <NoteCard key={note._id} note={note} index={i} onEdit={() => { setEditingNote(note); setShowModal(true); }} onDelete={() => handleDelete(note._id)} onTogglePin={() => handleTogglePin(note._id)} onToggleFavorite={() => handleToggleFavorite(note._id)} />
            ))}
          </div>
        </div>
      )}

      {!showSkeleton && !isTrashTab && regularNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3.5 h-0.5 rounded bg-surface-800" />
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Todas las notas</span>
              <span className="px-1.5 py-0.5 bg-surface-800 text-surface-400 text-2xs font-medium rounded">{regularNotes.length}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
