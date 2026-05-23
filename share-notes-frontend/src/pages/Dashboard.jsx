import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Plus, Star, RotateCcw, FileText, CheckSquare, Pin, Upload,
  Image, File, Trash2, Bell, Tag, BookOpen, ChevronRight, X,
  FolderOpen, Share2, Clock,
} from "lucide-react";
import useNoteStore from "../stores/useNoteStore.js";
import useAuthStore from "../stores/useAuthStore.js";
import NoteCard from "../components/notes/NoteCard.jsx";
import NoteForm from "../components/notes/NoteForm.jsx";
import Modal from "../components/ui/Modal.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { showToast } from "../utils/toast.jsx";
import api from "../api/axios.js";

const SkeletonCard = () => (
  <div className="bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 animate-fade-in-fast">
    <div className="h-5 bg-gray-200 dark:bg-white/[0.08] rounded-lg w-3/4 animate-pulse" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-white/[0.05] rounded-md animate-pulse" />
      <div className="h-3 bg-gray-200 dark:bg-white/[0.05] rounded-md w-5/6 animate-pulse" />
    </div>
    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-white/[0.04] mt-auto">
      <div className="h-5 w-16 bg-gray-200 dark:bg-white/[0.08] rounded-md animate-pulse" />
      <div className="h-5 w-12 bg-gray-200 dark:bg-white/[0.08] rounded-md animate-pulse" />
    </div>
  </div>
);

const getFileIcon = (file) => {
  const type = file.mimetype || file.type || "";
  const name = file.originalname || file.name || "";
  if (type.startsWith("image/")) return { Icon: Image, color: "text-sky-400", bg: "bg-sky-500/10" };
  if (name.endsWith(".pdf") || type === "application/pdf") return { Icon: FileText, color: "text-red-400", bg: "bg-red-500/10" };
  if (name.endsWith(".py")) return { Icon: File, color: "text-yellow-400", bg: "bg-yellow-500/10" };
  if (name.endsWith(".docx") || name.endsWith(".doc")) return { Icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" };
  return { Icon: File, color: "text-slate-400", bg: "bg-slate-500/10" };
};

const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const mockNotifications = [
  { id: 1, icon: Share2, color: "text-primary-400 bg-primary-500/10", text: "Nueva Nota Compartida por Edwin", time: "hace 5 min", unread: true },
  { id: 2, icon: FileText, color: "text-purple-400 bg-purple-500/10", text: 'Comentario en "Apuntes de IA" por Sandra', time: "hace 15 min", unread: true },
  { id: 3, icon: Clock, color: "text-red-400 bg-red-500/10", text: "Tarea Vencida", time: "hace 1 hora", unread: false },
];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab       = searchParams.get("tab");
  const category  = searchParams.get("category");
  const newNote   = searchParams.get("newNote");

  const {
    notes = [], fetchNotes, fetchCategories, categories = [],
    moveToTrash, togglePin, toggleFavorite,
    getFilteredNotes, setFavoriteFilter, isLoading,
    files = [], fetchFiles, deleteFile,
    trashNotes = [], restoreNote, permanentDelete, fetchTrash,
  } = useNoteStore();

  const user = useAuthStore((s) => s.user);

  const [showSkeleton, setShowSkeleton] = useState(false);
  const timerRef = useRef(null);
  const [showModal, setShowModal]        = useState(false);
  const [showCatModal, setShowCatModal]  = useState(false);
  const [newCatName, setNewCatName]      = useState("");
  const [newCatColor, setNewCatColor]    = useState("#6c63ff");
  const [creatingCat, setCreatingCat]    = useState(false);
  const [editingNote, setEditingNote]    = useState(null);
  const [uploading, setUploading]        = useState(false);
  const [notifOpen, setNotifOpen]        = useState(true);

  const isFavoritesTab = tab === "favorites";
  const isTrashTab     = tab === "trash";

  useEffect(() => {
    if (newNote === "1") {
      setShowModal(true);
      setSearchParams((p) => { p.delete("newNote"); return p; });
    }
  }, [newNote]);

  useEffect(() => {
    if (isLoading) { timerRef.current = setTimeout(() => setShowSkeleton(true), 400); }
    else { clearTimeout(timerRef.current); setShowSkeleton(false); }
    return () => clearTimeout(timerRef.current);
  }, [isLoading]);

  useEffect(() => {
    setFavoriteFilter(isFavoritesTab);
  }, [isFavoritesTab, setFavoriteFilter]);

  useEffect(() => {
    const load = async () => {
      if (isTrashTab) { const r = await fetchTrash(); if (!r.ok) showToast("Error al cargar papelera", "error"); }
      else { const r = await fetchNotes({}); if (!r.ok) showToast("Error al cargar notas", "error"); }
    };
    load();
  }, [isTrashTab]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchFiles?.(); }, []);

  const filteredNotes  = getFilteredNotes?.() || [];
  const pinFilter      = isFavoritesTab ? (n) => n.isFavorite : () => true;
  const pinnedNotes    = useMemo(() => filteredNotes.filter((n) => n.isPinned && pinFilter(n)), [filteredNotes]);
  const regularNotes   = useMemo(() => filteredNotes.filter((n) => !n.isPinned && pinFilter(n)), [filteredNotes]);
  const displayedNotes = isTrashTab ? trashNotes : regularNotes;

  const activeCatName = useMemo(() => categories?.find((c) => c._id === category)?.name || "", [categories, category]);

  const handleCloseModal = useCallback(() => { setShowModal(false); setEditingNote(null); }, []);
  const handleDelete     = useCallback(async (id) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    const r = await moveToTrash(id);
    if (r.ok) showToast("Nota movida a papelera", "success");
  }, [moveToTrash]);
  const handleTogglePin  = useCallback(async (id) => { await togglePin(id); }, [togglePin]);
  const handleToggleFav  = useCallback(async (id) => { await toggleFavorite(id); }, [toggleFavorite]);
  const handleRestore    = useCallback(async (id) => {
    const r = await restoreNote(id);
    if (r.ok) showToast("Nota restaurada", "success");
  }, [restoreNote]);
  const handlePermDelete = useCallback(async (id) => {
    if (!confirm("¿Eliminar permanentemente?")) return;
    const r = await permanentDelete(id);
    if (r.ok) showToast("Nota eliminada permanentemente", "error");
  }, [permanentDelete]);

  const handleUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (!uploadedFiles.length) return;
    setUploading(true);
    const formData = new FormData();
    uploadedFiles.forEach((f) => formData.append("files", f));
    try {
      await api.post("/files/upload", formData);
      await fetchFiles?.();
      showToast(`${uploadedFiles.length} archivo(s) subido(s)`, "success");
    } catch (err) {
      showToast("Error al subir: " + (err.response?.data?.message || err.message), "error");
    } finally { setUploading(false); e.target.value = ""; }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return showToast("Nombre de categoría requerido", "error");
    setCreatingCat(true);
    try {
      const res = await api.post("/categories", { name: newCatName.trim(), color: newCatColor });
      if (res.data) {
        showToast("Categoría creada", "success");
        setShowCatModal(false);
        setNewCatName("");
        setNewCatColor("#6c63ff");
        fetchCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Error al crear categoría", "error");
    } finally { setCreatingCat(false); }
  };

  const title = isTrashTab ? "Papelera" : isFavoritesTab ? "Notas Favoritas" : activeCatName || "Mis Notas";

  return (
    <div className="h-full flex overflow-hidden">
      {/* CENTER: Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 lg:pb-8 space-y-6">

          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-wide">{title}</h1>
              {!isTrashTab && !isFavoritesTab && (
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5 font-semibold">
                  {pinnedNotes.length > 0 && `${pinnedNotes.length} Fijadas · `}
                  {regularNotes.length} Todas Las Notas
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isTrashTab && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 via-primary-500 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden group/btn sm:hidden"
                >
                  <Plus className="w-4 h-4" />
                  Nueva nota
                </button>
              )}
              {isTrashTab && (
                <button
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-700 dark:text-slate-300 rounded-xl text-sm font-semibold border border-gray-200 dark:border-white/[0.07] transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Volver
                </button>
              )}
            </div>
          </div>

          {/* Skeletons */}
          {showSkeleton && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty */}
          {!showSkeleton && displayedNotes.length === 0 && pinnedNotes.length === 0 && !isTrashTab && (
            <EmptyState type={isFavoritesTab ? "favorites" : "notes"} onAction={() => setShowModal(true)} />
          )}
          {!showSkeleton && isTrashTab && trashNotes.length === 0 && <EmptyState type="trash" />}

          {/* Trash notes */}
          {!showSkeleton && isTrashTab && trashNotes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trashNotes.map((note, i) => (
                <NoteCard key={note._id} note={note} index={i}
                  onEdit={() => {}} onDelete={() => handlePermDelete(note._id)} onTogglePin={() => handleRestore(note._id)} />
              ))}
            </div>
          )}

          {/* Pinned notes */}
          {!showSkeleton && !isTrashTab && pinnedNotes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Pin className="w-3.5 h-3.5 text-primary-500 dark:text-primary-400" />
                <span className="text-[10px] font-extrabold text-gray-500 dark:text-slate-500 uppercase tracking-widest">Fijadas</span>
                <span className="px-1.5 py-0.5 bg-primary-500/10 border border-primary-500/15 text-primary-600 dark:text-primary-400 text-[10px] font-extrabold rounded-md">{pinnedNotes.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedNotes.map((note, i) => (
                  <NoteCard key={note._id} note={note} index={i}
                    onEdit={() => { setEditingNote(note); setShowModal(true); }}
                    onDelete={() => handleDelete(note._id)}
                    onTogglePin={() => handleTogglePin(note._id)}
                    onToggleFavorite={() => handleToggleFav(note._id)} />
                ))}
              </div>
            </section>
          )}

          {/* Regular notes */}
          {!showSkeleton && !isTrashTab && regularNotes.length > 0 && (
            <section>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.05]" />
                  <span className="text-[10px] font-extrabold text-gray-400 dark:text-slate-600 uppercase tracking-widest">Todas las notas</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] text-gray-500 dark:text-slate-600 text-[10px] font-extrabold rounded-md">{regularNotes.length}</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-white/[0.05]" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {regularNotes.map((note, i) => (
                  <NoteCard key={note._id} note={note} index={i}
                    onEdit={() => { setEditingNote(note); setShowModal(true); }}
                    onDelete={() => handleDelete(note._id)}
                    onTogglePin={() => handleTogglePin(note._id)}
                    onToggleFavorite={() => handleToggleFav(note._id)} />
                ))}
              </div>
            </section>
          )}

          {/* NOTIFICATIONS section */}
          {!isTrashTab && (
            <section className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  <span className="text-xs font-extrabold text-gray-700 dark:text-white uppercase tracking-widest">Notificaciones</span>
                </div>
                <button onClick={() => setNotifOpen(!notifOpen)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {notifOpen && (
                <div className="divide-y divide-gray-200 dark:divide-white/[0.04]">
                  {mockNotifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100/50 dark:hover:bg-white/[0.03] transition-colors group">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${n.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-slate-300 font-semibold leading-snug">{n.text}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-600 mt-0.5">{n.time}</p>
                        </div>
                        {n.unread && <div className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 mt-1 flex-shrink-0 shadow-sm shadow-primary-400" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* CATEGORIES section */}
          {!isTrashTab && categories.length >= 0 && (
            <section className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  <span className="text-xs font-extrabold text-gray-700 dark:text-white uppercase tracking-widest">Categorías</span>
                </div>
                <button
                  onClick={() => setShowCatModal(true)}
                  className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold transition-colors"
                >
                  + Nueva Categoría
                </button>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {categories.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-slate-500 w-full text-center py-2">Sin categorías aún</p>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSearchParams({ category: cat._id })}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.07] hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group"
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || "#6c63ff" }} />
                      <span className="text-xs font-semibold text-gray-600 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{cat.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600">{notes.filter((n) => n.categories?.includes(cat._id) || n.category === cat._id).length}</span>
                    </button>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Files */}
      <aside className="hidden xl:flex flex-col w-72 border-l border-gray-200 dark:border-white/[0.06] bg-gray-50/60 dark:bg-[#070714]/60 backdrop-blur-xl overflow-y-auto">

        {/* ARCHIVOS */}
        <section className="border-b border-gray-200 dark:border-white/[0.06]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              <span className="text-xs font-extrabold text-gray-700 dark:text-white uppercase tracking-widest">Archivos</span>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white text-[11px] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary-500/20">
              <Upload className="w-3 h-3" />
              {uploading ? "Subiendo..." : "Subir Archivos"}
              <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>

          <div className="px-3 pb-3">
            {(!files || files.length === 0) ? (
              <p className="text-[11px] text-gray-400 dark:text-slate-600 text-center py-6">No hay archivos subidos</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {(files || []).slice(0, 9).map((file) => {
                  const { Icon, color, bg } = getFileIcon(file);
                  const name = file.originalname || file.name || "archivo";
                  const size = formatSize(file.size);
                  return (
                    <div key={file._id || file.filename} className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.05] hover:border-primary-500/20 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-all cursor-default">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                        {file.mimetype?.startsWith("image/") && file.url ? (
                          <img src={file.url} alt={name} className="w-10 h-10 object-cover rounded-xl" />
                        ) : (
                          <Icon className={`w-5 h-5 ${color}`} />
                        )}
                      </div>
                      <p className="text-[9px] text-gray-500 dark:text-slate-400 text-center truncate w-full font-semibold leading-tight">{name}</p>
                      {size && <p className="text-[8px] text-gray-400 dark:text-slate-600">{size}</p>}
                      <button
                        onClick={() => deleteFile?.(file.filename || file._id)}
                        className="absolute top-1 right-1 p-0.5 rounded-md bg-red-500/0 hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {files && files.length > 9 && (
              <button onClick={() => navigate("/dashboard/files")} className="w-full mt-2 text-[11px] text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold py-1.5 transition-colors">
                Ver todos ({files.length}) →
              </button>
            )}
          </div>
        </section>

        {/* DOCUMENTACIÓN - REMOVED */}
      </aside>

      {/* Note Form Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingNote ? "Editar nota" : "Nueva nota"} size="lg">
        <NoteForm note={editingNote} onClose={handleCloseModal} />
      </Modal>

      {/* Category Creation Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in"
          onClick={() => setShowCatModal(false)}>
          <div className="w-full max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.08] rounded-3xl p-6 shadow-xl dark:shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Nueva Categoría</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Nombre</label>
                  <input
                    type="text" value={newCatName} autoFocus
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                    placeholder="Ej: Apuntes de IA"
                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.07] rounded-xl text-sm text-gray-900 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 dark:text-slate-400 mb-1.5">Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 dark:border-white/[0.07] bg-transparent" />
                    <div className="flex gap-1.5 flex-wrap">
                      {["#6c63ff","#f59e0b","#10b981","#ef4444","#ec4899","#3b82f6","#8b5cf6","#14b8a6","#f97316","#64748b"].map((c) => (
                        <button key={c} onClick={() => setNewCatColor(c)}
                          className={`w-7 h-7 rounded-lg border-2 transition-all ${newCatColor === c ? "border-white scale-110 shadow-md" : "border-transparent"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCatModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-slate-300 font-bold hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all border border-gray-200 dark:border-white/[0.06]">
                  Cancelar
                </button>
                <button onClick={handleCreateCategory} disabled={creatingCat}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold hover:from-primary-500 hover:to-purple-500 transition-all disabled:opacity-50 shadow-md shadow-primary-500/20">
                  {creatingCat ? "Creando..." : "Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
