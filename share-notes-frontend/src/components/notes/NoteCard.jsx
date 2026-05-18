import { useState, useEffect } from "react";
import { Maximize2, Copy, X, Pin, Trash2, Pencil, Star, Download, FileText, Check, Sparkles, Clock, Share2, Mail, ExternalLink, Loader2 } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Tooltip from "../ui/Tooltip.jsx";
import { exportToPDF } from "../../utils/exportPDF.js";
import { showToast } from "../../utils/toast.jsx";
import api from "../../api/axios";
import Button from "../ui/Button";

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onToggleFavorite, onDownload, external = false, onRate, showAuthor = false, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("read");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e) => { if (e.key === "Escape") setExpanded(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [expanded]);

  const [creatingDoc, setCreatingDoc] = useState(false);

  const handleGoogleDoc = async (force = false) => {
    if (force && note.googleDocId) {
      const ok = window.confirm("¿Regenerar el documento de Google? Se creará uno nuevo.");
      if (!ok) return;
    }
    setCreatingDoc(true);
    try {
      const url = force ? `/notes/${note._id}/google-doc?force=true` : `/notes/${note._id}/google-doc`;
      const res = await api.post(url);
      if (res.data.googleDocUrl) {
        window.open(res.data.googleDocUrl, "_blank");
        showToast("Documento de Google creado", "success");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error al crear documento";
      if (msg.includes("GOOGLE_SERVICE_ACCOUNT_JSON")) {
        showToast("Google Docs no está configurado en el servidor", "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setCreatingDoc(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) { showToast("Ingresa un email", "error"); return; }
    setSharing(true);
    try {
      const res = await api.post(`/notes/${note._id}/share`, { email: shareEmail, permission: sharePermission });
      showToast(res.data.message || "Nota compartida", "success");
      setShareEmail("");
      setShowShareModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al compartir", "error");
    } finally {
      setSharing(false);
    }
  };

  const date = new Date(note.updatedAt).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const createdDate = note.createdAt ? new Date(note.createdAt).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) : date;

  const renderStars = () => {
    const stars = [];
    const rating = note.rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => onRate && onRate(note._id, i)}
          disabled={!onRate}
          className={`w-4 h-4 transition-transform hover:scale-125 ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"} ${onRate ? "hover:text-yellow-400 cursor-pointer" : ""}`}
        >
          <Star className="w-4 h-4" fill={i <= Math.round(rating) ? "currentColor" : "none"} />
        </button>
      );
    }
    return stars;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      showToast("Copiado al portapapeles", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("No se pudo copiar", "error");
    }
  };

  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col animate-fade-in" onClick={() => setExpanded(false)}>
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm" />
        <div className="relative flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{note.title}</h2>
            {note.isPinned && <Pin className="w-5 h-5 text-primary-500 fill-primary-500 flex-shrink-0" />}
            {note.isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleCopy} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-sm font-medium text-gray-700 dark:text-gray-300">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            {!external && (
              <>
                <button onClick={() => handleGoogleDoc(!!note.googleDocId)} disabled={creatingDoc} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {creatingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  {creatingDoc ? "Exportando..." : note.googleDocId ? "Regenerar" : "Google Docs"}
                </button>
                <button onClick={() => setShowShareModal(true)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-500">
                  <Share2 className="w-4 h-4" /> Compartir
                </button>
              </>
            )}
            <button onClick={() => exportToPDF(note)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button onClick={() => setExpanded(false)} className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-sm font-medium text-gray-500 hover:text-red-500">
              <X className="w-5 h-5" />
              Cerrar
            </button>
          </div>
        </div>
        <div className="relative flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50/50 to-purple-50/30 dark:from-gray-950/50 dark:to-purple-950/10" onClick={e => e.stopPropagation()}>
          <div className="max-w-3xl mx-auto">
            {note.category && (
              <Badge label={note.category.name} color={note.category.color} className="mb-6 animate-slide-up" />
            )}
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg leading-relaxed animate-fade-in text-gray-700 dark:text-gray-300">
              {note.content}
            </div>
            {note.description && (
              <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-slide-up delay-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Resumen</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{note.description}</p>
              </div>
            )}
          </div>
        </div>

        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShareModal(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in border border-gray-100 dark:border-dark-800" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-1">Compartir nota</h3>
              <p className="text-sm text-gray-500 mb-5">Comparte "{note.title}" con otro usuario</p>
              <form onSubmit={handleShare} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email del usuario</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@ejemplo.com" className="input-field pl-10" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Permiso</label>
                  <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} className="input-field">
                    <option value="read">Solo lectura</option>
                    <option value="edit">Puede editar</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowShareModal(false)} className="flex-1 btn-secondary">Cancelar</button>
                  <Button type="submit" isLoading={sharing} className="flex-1">Compartir</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`group bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-800 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 ${note.isPinned ? "ring-2 ring-primary-500/30" : ""} ${note.isFavorite ? "ring-2 ring-yellow-400/30" : ""} animate-scale-in`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="px-6 pt-6 pb-6 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && <Pin className="w-4 h-4 text-primary-500 fill-primary-500 flex-shrink-0" />}
          {note.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
          <h3 className="font-bold text-lg leading-snug text-gray-900 dark:text-white line-clamp-2 flex-1">{note.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip text="Expandir">
            <button onClick={() => setExpanded(true)} className="p-2 rounded-xl text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all hover:scale-110">
              <Maximize2 className="w-4 h-4" />
            </button>
          </Tooltip>
          {!external && (
            <>
              <Tooltip text={creatingDoc ? "Exportando..." : (note.googleDocId ? "Regenerar Google Doc" : "Crear Google Doc")}>
                <button onClick={(e) => { e.stopPropagation(); handleGoogleDoc(!!note.googleDocId); }} disabled={creatingDoc} className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {creatingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                </button>
              </Tooltip>
              <Tooltip text="Compartir">
                <button onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }} className="p-2 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:scale-110">
                  <Share2 className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text={note.isPinned ? "Desfijar" : "Fijar"}>
                <button onClick={() => onTogglePin(note._id)} className={`p-2 rounded-xl transition-all hover:scale-110 ${note.isPinned ? "text-primary-500 bg-primary-50 dark:bg-primary-900/30" : "text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"}`}>
                  <Pin className="w-4 h-4" fill={note.isPinned ? "currentColor" : "none"} />
                </button>
              </Tooltip>
              <Tooltip text={note.isFavorite ? "Quitar favorito" : "Favorito"}>
                <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-2 rounded-xl transition-all hover:scale-110 ${note.isFavorite ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/20" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"}`}>
                  <Star className="w-4 h-4" fill={note.isFavorite ? "currentColor" : "none"} />
                </button>
              </Tooltip>
              <Tooltip text="Editar">
                <button onClick={() => onEdit(note)} className="p-2 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110">
                  <Pencil className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="Eliminar">
                <button onClick={() => onDelete(note._id)} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-110">
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>
            </>
          )}
          {external && (
            <>
              <Tooltip text="Favorito">
                <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-2 rounded-xl transition-all hover:scale-110 ${note.isFavorite ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"}`}>
                  <Star className="w-4 h-4" fill={note.isFavorite ? "currentColor" : "none"} />
                </button>
              </Tooltip>
              <Tooltip text="Descargar">
                <button onClick={() => onDownload && onDownload(note._id)} className="p-2 rounded-xl text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:scale-110">
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="PDF">
                <button onClick={() => exportToPDF(note)} className="p-2 rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all hover:scale-110">
                  <FileText className="w-4 h-4" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {note.description && (
        <p className="text-sm text-gray-500 dark:text-dark-400 line-clamp-2 italic">{note.description}</p>
      )}

      <p className="text-sm text-gray-500 dark:text-dark-400 line-clamp-3 leading-relaxed flex-1">{note.content}</p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-dark-800">
        <div className="flex items-center gap-2">
          {note.category && note.category.name && <Badge label={note.category.name} color={note.category.color} />}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {external && (
            <>
              <div className="flex items-center gap-1">{renderStars()}</div>
              <div className="flex items-center gap-1"><Download className="w-3 h-3" />{note.downloads}</div>
            </>
          )}
          <span className="flex items-center gap-1" title={`Actualizado: ${date}`}>
            <Clock className="w-3 h-3" />
            {date}
          </span>
        </div>
      </div>

      {external && showAuthor && note.user && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-dark-800">
          {note.user.avatar ? (
            <img src={note.user.avatar} alt={note.user.name} referrerPolicy="no-referrer" className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white">
              {note.user.name?.charAt(0)}
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-dark-400">Por {note.user.name}</span>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShareModal(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-dark-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in border border-gray-100 dark:border-dark-800" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">Compartir nota</h3>
            <p className="text-sm text-gray-500 mb-5">Comparte "{note.title}" con otro usuario</p>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email del usuario</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@ejemplo.com" className="input-field pl-10" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Permiso</label>
                <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} className="input-field">
                  <option value="read">Solo lectura</option>
                  <option value="edit">Puede editar</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowShareModal(false)} className="flex-1 btn-secondary">Cancelar</button>
                <Button type="submit" isLoading={sharing} className="flex-1">Compartir</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default NoteCard;
