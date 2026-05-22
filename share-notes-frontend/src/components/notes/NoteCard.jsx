import { useState, useEffect } from "react";
import { Maximize2, Copy, X, Pin, Trash2, Pencil, Star, Download, FileText, Check, Sparkles, Clock, Share2, Mail, Loader2, ExternalLink } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Tooltip from "../ui/Tooltip.jsx";
import { exportToPDF } from "../../utils/exportPDF.js";
import { showToast } from "../../utils/toast.jsx";
import api, { API_BASE } from "../../api/axios";
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

  const [exportingDocx, setExportingDocx] = useState(false);
  const [exportingGdoc, setExportingGdoc] = useState(false);

  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      const res = await api.post(`/notes/${note._id}/export-docx`, {}, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${note.title.replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, "").trim() || "nota"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Documento Word descargado", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Error al exportar a Word";
      showToast(msg, "error");
    } finally {
      setExportingDocx(false);
    }
  };

  const handleExportGoogleDoc = async () => {
    setExportingGdoc(true);
    try {
      const res = await api.post(`/notes/${note._id}/google-doc`);
      if (res.data?.googleDocUrl) {
        window.open(res.data.googleDocUrl, "_blank");
        showToast("Google Doc creado con éxito", "success");
      } else {
        showToast(res.data?.message || "Documento creado", "success");
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "";
      const detail = err.response?.data?.detail || "";

      if (status === 403 || detail.toLowerCase().includes("insufficient") || detail.toLowerCase().includes("scope") || detail.toLowerCase().includes("permis")) {
        const currentUrl = window.location.href;
        showToast("Se requieren permisos de Google Drive. Redirigiendo...", "info");
        window.location.href = `${API_BASE}/auth/google/drive?redirectTo=${encodeURIComponent(currentUrl)}`;
      } else if (msg.includes("conectar tu cuenta de Google")) {
        showToast("Conecta tu cuenta de Google desde tu perfil primero", "error");
      } else {
        showToast(msg || "Error al exportar a Google Docs", "error");
      }
    } finally {
      setExportingGdoc(false);
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
      <div className="fixed inset-0 z-50 flex flex-col bg-surface-950/95 backdrop-blur-sm" onClick={() => setExpanded(false)}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800/60 bg-surface-900/80 backdrop-blur-xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base font-semibold text-surface-100 truncate">{note.title}</h2>
            {note.isPinned && <Pin className="w-4 h-4 text-primary-400 fill-primary-400 flex-shrink-0" />}
            {note.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleCopy} className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium text-surface-300">
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            {!external && (
              <>
                <button onClick={handleExportDocx} disabled={exportingDocx} className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium text-surface-300 disabled:opacity-40">
                  {exportingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Word
                </button>
                <button onClick={handleExportGoogleDoc} disabled={exportingGdoc} className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium text-surface-300 disabled:opacity-40">
                  {exportingGdoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  Google Doc
                </button>
                <button onClick={() => setShowShareModal(true)} className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium text-surface-300">
                  <Share2 className="w-3.5 h-3.5" /> Compartir
                </button>
              </>
            )}
            <button onClick={() => exportToPDF(note)} className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium text-surface-300">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={() => setExpanded(false)} className="px-3 py-1.5 bg-surface-800 hover:bg-red-500/10 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium text-surface-400 hover:text-red-400">
              <X className="w-3.5 h-3.5" /> Cerrar
            </button>
          </div>
        </div>
        <div className="relative flex-1 overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="max-w-3xl mx-auto p-6 md:p-10">
            {note.category && (
              <Badge label={note.category.name} color={note.category.color} />
            )}
            <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-surface-200 font-light">
              {note.content}
            </div>
            {note.description && (
              <div className="mt-8 p-5 bg-surface-900 rounded-xl border border-surface-800">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span className="text-xs font-semibold text-surface-500">Resumen</span>
                </div>
                <p className="text-sm text-surface-400">{note.description}</p>
              </div>
            )}
          </div>
        </div>

        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
            <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 max-w-md w-full shadow-tesla-lg animate-scale-in" onClick={e => e.stopPropagation()}>
              <h3 className="font-semibold text-surface-100 mb-1">Compartir nota</h3>
              <p className="text-xs text-surface-500 mb-4">Comparte &quot;{note.title}&quot; con otro usuario</p>
              <form onSubmit={handleShare} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">Email del usuario</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@ejemplo.com" className="input-field pl-9" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-surface-400 mb-1">Permiso</label>
                  <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} className="input-field">
                    <option value="read">Solo lectura</option>
                    <option value="edit">Puede editar</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowShareModal(false)} className="btn-secondary flex-1">Cancelar</button>
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
      className={`group bg-surface-900 border border-surface-800/60 rounded-xl flex flex-col gap-3 transition-all duration-300 hover:border-surface-700/80 hover:bg-surface-850 hover:shadow-tesla-card-hover ${note.isPinned ? "ring-1 ring-primary-500/30 border-primary-500/20" : ""} ${note.isFavorite ? "ring-1 ring-yellow-500/20" : ""} animate-fade-in-fast`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="px-4 pt-4 pb-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && <Pin className="w-3.5 h-3.5 text-primary-400 fill-primary-400 flex-shrink-0" />}
          {note.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
          <h3 className="font-semibold text-sm leading-snug text-surface-100 line-clamp-2 flex-1">{note.title}</h3>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip text="Expandir">
            <button onClick={() => setExpanded(true)} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          {!external && (
            <>
              <Tooltip text={exportingDocx ? "Exportando..." : "Word"}>
                <button onClick={(e) => { e.stopPropagation(); handleExportDocx(); }} disabled={exportingDocx} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all disabled:opacity-30">
                  {exportingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                </button>
              </Tooltip>
              <Tooltip text={exportingGdoc ? "Exportando..." : "Google Doc"}>
                <button onClick={(e) => { e.stopPropagation(); handleExportGoogleDoc(); }} disabled={exportingGdoc} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all disabled:opacity-30">
                  {exportingGdoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                </button>
              </Tooltip>
              <Tooltip text="Compartir">
                <button onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip text={note.isPinned ? "Desfijar" : "Fijar"}>
                <button onClick={() => onTogglePin(note._id)} className={`p-1.5 rounded-md transition-all ${note.isPinned ? "text-primary-400" : "text-surface-500 hover:text-surface-200 hover:bg-surface-800"}`}>
                  <Pin className="w-3.5 h-3.5" fill={note.isPinned ? "currentColor" : "none"} />
                </button>
              </Tooltip>
              <Tooltip text={note.isFavorite ? "Quitar favorito" : "Favorito"}>
                <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-1.5 rounded-md transition-all ${note.isFavorite ? "text-yellow-400" : "text-surface-500 hover:text-surface-200 hover:bg-surface-800"}`}>
                  <Star className="w-3.5 h-3.5" fill={note.isFavorite ? "currentColor" : "none"} />
                </button>
              </Tooltip>
              <Tooltip text="Editar">
                <button onClick={() => onEdit(note)} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip text="Eliminar">
                <button onClick={() => onDelete(note._id)} className="p-1.5 rounded-md text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </>
          )}
          {external && (
            <>
              <Tooltip text="Favorito">
                <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-1.5 rounded-md transition-all ${note.isFavorite ? "text-yellow-400" : "text-surface-500 hover:text-surface-200 hover:bg-surface-800"}`}>
                  <Star className="w-3.5 h-3.5" fill={note.isFavorite ? "currentColor" : "none"} />
                </button>
              </Tooltip>
              <Tooltip text="Descargar">
                <button onClick={() => onDownload && onDownload(note._id)} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip text="PDF">
                <button onClick={() => exportToPDF(note)} className="p-1.5 rounded-md text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all">
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {note.description && (
        <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed">{note.description}</p>
      )}

      <p className="text-xs text-surface-400 line-clamp-3 leading-relaxed flex-1">{note.content}</p>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-surface-800/60">
        <div className="flex items-center gap-2">
          {note.category && note.category.name && <Badge label={note.category.name} color={note.category.color} />}
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-500">
          {external && (
            <>
              <div className="flex items-center gap-1">{renderStars()}</div>
              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{note.downloads}</span>
            </>
          )}
          <span className="flex items-center gap-1" title={`Actualizado: ${date}`}>
            <Clock className="w-3 h-3" />
            {date}
          </span>
        </div>
      </div>

      {external && showAuthor && note.user && (
        <div className="flex items-center gap-2 pt-3 border-t border-surface-800/60">
          {note.user.avatar ? (
            <img src={note.user.avatar} alt={note.user.name} referrerPolicy="no-referrer" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-surface-800 flex items-center justify-center text-2xs font-medium text-surface-400">
              {note.user.name?.charAt(0)}
            </div>
          )}
          <span className="text-xs text-surface-500">Por {note.user.name}</span>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 max-w-md w-full shadow-tesla-lg animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-surface-100 mb-1">Compartir nota</h3>
            <p className="text-xs text-surface-500 mb-4">Comparte &quot;{note.title}&quot; con otro usuario</p>
            <form onSubmit={handleShare} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Email del usuario</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@ejemplo.com" className="input-field pl-9" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1">Permiso</label>
                <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} className="input-field">
                  <option value="read">Solo lectura</option>
                  <option value="edit">Puede editar</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowShareModal(false)} className="btn-secondary flex-1">Cancelar</button>
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
