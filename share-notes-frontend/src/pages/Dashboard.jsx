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
  <div
    className="bg-white/85 dark:bg-[#0a0819]/90 backdrop-blur-xl border border-gray-200/50 dark:border-[#7c3aed]/15 rounded-2xl p-4.5 flex items-center gap-3.5 animate-slide-up hover:border-primary-500/25 dark:hover:border-[#7c3aed]/30 hover:bg-white dark:hover:bg-[#0a0819] hover:shadow-lg hover:shadow-primary-500/[0.02] dark:hover:shadow-[#7c3aed]/5 hover:-translate-y-0.5 transition-all duration-300 cursor-default shadow-sm shadow-gray-200/[0.01] dark:shadow-[#7c3aed]/5"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-11 h-11 bg-primary-500/10 dark:bg-[#7c3aed]/20 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-primary-500/15 dark:ring-[#7c3aed]/20">
      <Icon className="w-5.5 h-5.5 text-primary-600 dark:text-[#a78bfa]" />
    </div>
    <div className="min-w-0">
      <p className="text-xl font-extrabold text-gray-800 dark:text-[#e2e8f0] tabular-nums leading-none mb-1 tracking-tight">{value}</p>
      <p className="text-[11px] text-gray-400 dark:text-[#71717a] font-bold uppercase tracking-wider truncate">{label}</p>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white/80 dark:bg-[#0a0819]/80 backdrop-blur-xl border border-gray-200/50 dark:border-[#7c3aed]/10 rounded-2xl p-5.5 flex flex-col gap-3.5 animate-fade-in-fast shadow-sm">
    <div className="h-5 bg-gray-200 dark:bg-[#1a0533]/60 rounded-lg w-3/4 animate-pulse" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-[#1a0533]/40 rounded-md animate-pulse" />
      <div className="h-3 bg-gray-200 dark:bg-[#1a0533]/40 rounded-md w-5/6 animate-pulse" />
    </div>
    <div className="flex gap-2 pt-3.5 border-t border-gray-100 dark:border-[#7c3aed]/10 mt-auto">
      <div className="h-5 w-16 bg-gray-200 dark:bg-[#1a0533]/60 rounded-md animate-pulse" />
      <div className="h-5 w-12 bg-gray-200 dark:bg-[#1a0533]/60 rounded-md animate-pulse" />
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
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-8">
      {/* Premium Welcome Banner */}
      {showWelcome && notes.length === 0 && !isLoading && (
        <div className="mb-6.5 p-6 sm:p-8 bg-gradient-to-br from-primary-600 via-primary-500 to-purple-600 rounded-3xl text-white relative overflow-hidden animate-scale-in border border-primary-500/20 shadow-xl shadow-primary-500/10">
          {/* Animated Glow backdrops */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[40%] h-[150%] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent rotate-12 pointer-events-none animate-[shimmer_6s_infinite]" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                  <Sparkles className="w-4 h-4 text-primary-200" />
                </div>
                <span className="text-[11px] font-extrabold text-primary-200 uppercase tracking-widest leading-none">¡Bienvenido!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-1.5 tracking-wide leading-tight">Hola, {user?.name?.split(" ")[0]}</h2>
              <p className="text-primary-100 text-sm font-medium leading-relaxed max-w-xl">
                Crea tu primera nota, organiza tus asignaturas, y lleva el control absoluto de tus apuntes con la mejor experiencia.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-primary-50 text-primary-600 hover:text-primary-700 font-extrabold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4" />
                  Crear primera nota
                </button>
                <button
                  onClick={() => navigate("/dashboard/explore")}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold rounded-xl text-sm transition-all hover:-translate-y-0.5"
                >
                  Explorar compartidos
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/10 flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid of Stat Cards */}
      {(!isTrashTab || (isTrashTab && trashNotes.length === 0)) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
          <StatCard icon={FileText} label="Total notas" value={loadNotesCount} delay={0} />
          <StatCard icon={Star} label="Favoritos" value={totalFavorites} delay={100} />
          <StatCard icon={CheckSquare} label={`Tareas (${completedTasks}/${totalTasks})`} value={completedTasks} delay={200} />
          <StatCard icon={TrendingUp} label="Categorías" value={categories?.length || 0} delay={300} />
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-dark-100 tracking-wide">{title}</h1>
            {!isTrashTab && !isFavoritesTab && (
              <span className="px-2 py-0.5 bg-primary-500/10 dark:bg-primary-500/15 border border-primary-500/15 text-primary-500 text-xs font-extrabold rounded-lg">
                {displayedNotes.length}
              </span>
            )}
          </div>
          {!isTrashTab && !isFavoritesTab && notes.length > 0 && (
            <p className="text-xs font-semibold text-gray-400 dark:text-dark-500 mt-1">
              {pinnedNotes.length > 0 && `${pinnedNotes.length} fijadas · `}{regularNotes.length} notas
            </p>
          )}
          {isTrashTab && <p className="text-xs font-semibold text-gray-400 dark:text-dark-500 mt-1">{trashNotes.length} notas en papelera</p>}
          {isFavoritesTab && <p className="text-xs font-semibold text-gray-400 dark:text-dark-500 mt-1">{displayedNotes.length} notas favoritas</p>}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                localSearchNotes(e.target.value);
              }}
              placeholder={isTrashTab ? "Buscar en papelera..." : "Buscar notas..."}
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 dark:bg-[#0a0819]/80 border border-gray-300/20 dark:border-[#7c3aed]/15 rounded-xl text-sm text-gray-800 dark:text-[#e2e8f0] placeholder-gray-400 dark:placeholder-[#52525b] focus:outline-none focus:border-[#7c3aed]/50 focus:ring-4 focus:ring-[#7c3aed]/5 transition-all font-semibold"
            />
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            {!isTrashTab && (
              <Button icon={Plus} onClick={() => setShowModal(true)} className="w-full sm:w-auto font-extrabold py-2.5 rounded-xl shadow-md hover:shadow-lg">
                Nueva nota
              </Button>
            )}
            {isTrashTab && (
              <Button variant="secondary" icon={RotateCcw} onClick={() => setSearchParams({})} className="w-full sm:w-auto font-bold py-2.5 rounded-xl">
                Volver
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {showSkeleton && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty States */}
      {!showSkeleton && displayedNotes.length === 0 && !isTrashTab && (
        <EmptyState type={isFavoritesTab ? "favorites" : "notes"} onAction={!isTrashTab ? () => setShowModal(true) : undefined} />
      )}

      {!showSkeleton && displayedNotes.length === 0 && isTrashTab && <EmptyState type="trash" />}

      {/* Trash Tab List */}
      {!showSkeleton && isTrashTab && trashNotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {trashNotes.map((note, i) => (
            <NoteCard
              key={note._id}
              note={note}
              index={i}
              onEdit={() => {}}
              onDelete={() => handlePermanentDelete(note._id)}
              onTogglePin={() => handleRestore(note._id)}
            />
          ))}
        </div>
      )}

      {/* Pinned Notes Section */}
      {!showSkeleton && !isTrashTab && pinnedNotes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3.5">
            <Pin className="w-3.5 h-3.5 text-[#a78bfa]" />
            <span className="text-2xs font-extrabold text-gray-400 dark:text-[#52525b] uppercase tracking-widest">Fijadas</span>
            <span className="px-1.5 py-0.5 bg-[#7c3aed]/10 dark:bg-[#7c3aed]/15 border border-[#7c3aed]/15 text-[#a78bfa] text-3xs font-extrabold rounded-md">{pinnedNotes.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {pinnedNotes.map((note, i) => (
              <NoteCard
                key={note._id}
                note={note}
                index={i}
                onEdit={() => { setEditingNote(note); setShowModal(true); }}
                onDelete={() => handleDelete(note._id)}
                onTogglePin={() => handleTogglePin(note._id)}
                onToggleFavorite={() => handleToggleFavorite(note._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes Section */}
      {!showSkeleton && !isTrashTab && regularNotes.length > 0 && (
        <div>
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-4 h-px rounded bg-gray-200 dark:bg-[#7c3aed]/20" />
              <span className="text-2xs font-extrabold text-gray-400 dark:text-[#52525b] uppercase tracking-widest">Todas las notas</span>
              <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#0a0819] border border-gray-200/50 dark:border-[#7c3aed]/10 text-gray-500 dark:text-[#52525b] text-3xs font-extrabold rounded-md">{regularNotes.length}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {regularNotes.map((note, i) => (
              <NoteCard
                key={note._id}
                note={note}
                index={i}
                onEdit={() => { setEditingNote(note); setShowModal(true); }}
                onDelete={() => handleDelete(note._id)}
                onTogglePin={() => handleTogglePin(note._id)}
                onToggleFavorite={() => handleToggleFavorite(note._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Note Form Dialog Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingNote ? "Editar nota" : "Nueva nota"} size="lg">
        <NoteForm note={editingNote} onClose={handleCloseModal} />
      </Modal>
    </div>
  );
};

export default Dashboard;
