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

  const renderStars = () => {
    const stars = [];
    const rating = note.rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => onRate && onRate(note._id, i)}
          disabled={!onRate}
          className={`w-4 h-4 transition-transform hover:scale-125 ${i <= Math.round(rating) ? "text-amber-400" : "text-gray-300 dark:text-dark-600"} ${onRate ? "hover:text-amber-400 cursor-pointer" : ""}`}
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
      <div className="fixed inset-0 z-50 flex flex-col bg-white/80 dark:bg-dark-950/80 backdrop-blur-2xl animate-fade-in" onClick={() => setExpanded(false)}>
        {/* Expanded Top Action Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/50 dark:border-white/[0.04] bg-white/60 dark:bg-dark-900/60 backdrop-blur-md" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base font-extrabold text-gray-800 dark:text-dark-100 truncate">{note.title}</h2>
            {note.isPinned && <Pin className="w-4 h-4 text-primary-500 fill-primary-500 flex-shrink-0 animate-pulse-glow" />}
            {note.isFavorite && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleCopy} className="btn-secondary px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
            {!external && (
              <>
                <button onClick={handleExportDocx} disabled={exportingDocx} className="btn-secondary px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold disabled:opacity-40">
                  {exportingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Word
                </button>
                <button onClick={handleExportGoogleDoc} disabled={exportingGdoc} className="btn-secondary px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold disabled:opacity-40">
                  {exportingGdoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  Google Doc
                </button>
                <button onClick={() => setShowShareModal(true)} className="btn-secondary px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold">
                  <Share2 className="w-3.5 h-3.5" /> Compartir
                </button>
              </>
            )}
            <button onClick={() => exportToPDF(note)} className="btn-secondary px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={() => setExpanded(false)} className="btn-secondary px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold hover:!text-red-500 hover:!border-red-500/10 hover:!bg-red-500/5">
              <X className="w-3.5 h-3.5" /> Cerrar
            </button>
          </div>
        </div>

        {/* Expanded Content Panel */}
        <div className="relative flex-1 overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="max-w-3xl mx-auto p-6 md:p-12">
            {note.category && (
              <div className="inline-block">
                <Badge label={note.category.name} color={note.category.color} />
              </div>
            )}
            <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-dark-200 font-medium">
              {note.content}
            </div>
            {note.description && (
              <div className="mt-10 p-6 bg-gray-50/50 dark:bg-dark-900/50 rounded-2xl border border-gray-200/40 dark:border-white/[0.04]">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                  <span className="text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider">Resumen</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-300 leading-relaxed font-semibold">{note.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Share Modal in Expanded */}
        {showShareModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md" onClick={() => setShowShareModal(false)}>
            <div className="bg-white dark:bg-dark-900 border border-gray-300/20 dark:border-white/[0.06] rounded-3xl p-6.5 max-w-md w-full shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
              <h3 className="font-extrabold text-lg text-gray-800 dark:text-dark-100 mb-1 tracking-wide">Compartir nota</h3>
              <p className="text-xs text-gray-400 dark:text-dark-500 mb-5 font-medium">Comparte &quot;{note.title}&quot; con otro usuario</p>
              <form onSubmit={handleShare} className="space-y-4.5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Email del usuario</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-500" />
                    <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@ejemplo.com" className="input-field pl-9.5 font-medium" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Permiso</label>
                  <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} className="input-field font-semibold">
                    <option value="read">Solo lectura</option>
                    <option value="edit">Puede editar</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowShareModal(false)} className="btn-secondary flex-1 font-bold">Cancelar</button>
                  <Button type="submit" isLoading={sharing} className="flex-1 font-bold">Compartir</Button>
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
      className={`group bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border rounded-2xl flex flex-col gap-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-300/[0.04] dark:hover:shadow-black/[0.12]
        ${note.isPinned ? "border-primary-500/35 dark:border-primary-500/20 ring-1 ring-primary-500/25 dark:ring-primary-500/10 shadow-sm shadow-primary-500/[0.04]" : "border-gray-200/50 dark:border-white/[0.04] shadow-sm shadow-gray-200/[0.02] dark:shadow-black/[0.02]"}
        ${note.isFavorite ? "ring-1 ring-amber-500/15 border-amber-500/20" : ""}
        animate-fade-in-fast`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="px-5 pt-5 pb-4.5 flex flex-col gap-3.5 h-full">
        {/* Card Title & Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {note.isPinned && <Pin className="w-3.5 h-3.5 text-primary-500 fill-primary-500 flex-shrink-0 animate-pulse-glow" />}
            {note.isFavorite && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
            <h3 className="font-extrabold text-sm leading-snug text-gray-800 dark:text-dark-100 line-clamp-2 flex-1 tracking-wide group-hover:text-primary-500 transition-colors">
              {note.title}
            </h3>
          </div>

          {/* Quick actions hover overlay */}
          <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Tooltip text="Expandir">
              <button onClick={() => setExpanded(true)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all border border-transparent dark:hover:border-white/[0.04]">
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            {!external && (
              <>
                <Tooltip text={exportingDocx ? "Exportando..." : "Word"}>
                  <button onClick={(e) => { e.stopPropagation(); handleExportDocx(); }} disabled={exportingDocx} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all disabled:opacity-30 border border-transparent dark:hover:border-white/[0.04]">
                    {exportingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </Tooltip>
                <Tooltip text={exportingGdoc ? "Exportando..." : "Google Doc"}>
                  <button onClick={(e) => { e.stopPropagation(); handleExportGoogleDoc(); }} disabled={exportingGdoc} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all disabled:opacity-30 border border-transparent dark:hover:border-white/[0.04]">
                    {exportingGdoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  </button>
                </Tooltip>
                <Tooltip text="Compartir">
                  <button onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all border border-transparent dark:hover:border-white/[0.04]">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip text={note.isPinned ? "Desfijar" : "Fijar"}>
                  <button onClick={() => onTogglePin(note._id)} className={`p-1.5 rounded-lg transition-all border border-transparent dark:hover:border-white/[0.04] ${note.isPinned ? "text-primary-500 bg-primary-500/5 dark:bg-primary-500/10" : "text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800"}`}>
                    <Pin className="w-3.5 h-3.5" fill={note.isPinned ? "currentColor" : "none"} />
                  </button>
                </Tooltip>
                <Tooltip text={note.isFavorite ? "Quitar favorito" : "Favorito"}>
                  <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-1.5 rounded-lg transition-all border border-transparent dark:hover:border-white/[0.04] ${note.isFavorite ? "text-amber-500 bg-amber-500/5 dark:bg-amber-500/10" : "text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800"}`}>
                    <Star className="w-3.5 h-3.5" fill={note.isFavorite ? "currentColor" : "none"} />
                  </button>
                </Tooltip>
                <Tooltip text="Editar">
                  <button onClick={() => onEdit(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all border border-transparent dark:hover:border-white/[0.04]">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip text="Eliminar">
                  <button onClick={() => onDelete(note._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/5 dark:text-dark-500 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </>
            )}
            {external && (
              <>
                <Tooltip text="Favorito">
                  <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-1.5 rounded-lg transition-all border border-transparent dark:hover:border-white/[0.04] ${note.isFavorite ? "text-amber-500 bg-amber-500/5 dark:bg-amber-500/10" : "text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800"}`}>
                    <Star className="w-3.5 h-3.5" fill={note.isFavorite ? "currentColor" : "none"} />
                  </button>
                </Tooltip>
                <Tooltip text="Descargar">
                  <button onClick={() => onDownload && onDownload(note._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all border border-transparent dark:hover:border-white/[0.04]">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
                <Tooltip text="PDF">
                  <button onClick={() => exportToPDF(note)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:text-dark-500 dark:hover:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all border border-transparent dark:hover:border-white/[0.04]">
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                </Tooltip>
              </>
            )}
          </div>
        </div>

        {/* Note Description (Summary) */}
        {note.description && (
          <p className="text-[11px] text-gray-500 dark:text-dark-400 font-bold leading-relaxed line-clamp-2 bg-gray-50/40 dark:bg-dark-850/40 p-2.5 rounded-xl border border-gray-100/50 dark:border-white/[0.02]">
            <Sparkles className="w-3 h-3 inline-block text-primary-500 dark:text-primary-400 mr-1.5 -mt-0.5" />
            {note.description}
          </p>
        )}

        {/* Note Content preview */}
        <p className="text-xs text-gray-500 dark:text-dark-400 line-clamp-4 leading-relaxed flex-1 font-medium select-none">
          {note.content}
        </p>

        {/* Footer Meta Details */}
        <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-gray-100 dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            {note.category && note.category.name && (
              <Badge label={note.category.name} color={note.category.color} />
            )}
          </div>
          <div className="flex items-center gap-2.5 text-2xs font-bold text-gray-400 dark:text-dark-500">
            {external && (
              <>
                <div className="flex items-center gap-1">{renderStars()}</div>
                <span className="flex items-center gap-1"><Download className="w-3 h-3" />{note.downloads}</span>
              </>
            )}
            <span className="flex items-center gap-1.5" title={`Actualizado: ${date}`}>
              <Clock className="w-3 h-3" />
              {date}
            </span>
          </div>
        </div>

        {/* External Author box */}
        {external && showAuthor && note.user && (
          <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100 dark:border-white/[0.04]">
            {note.user.avatar ? (
              <img src={note.user.avatar} alt={note.user.name} referrerPolicy="no-referrer" className="w-5.5 h-5.5 rounded-full object-cover ring-1 ring-gray-200 dark:ring-white/[0.06]" />
            ) : (
              <div className="w-5.5 h-5.5 rounded-full bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-[10px] font-bold text-primary-500">
                {note.user.name?.charAt(0)}
              </div>
            )}
            <span className="text-2xs font-bold text-gray-400 dark:text-dark-500">Por {note.user.name}</span>
          </div>
        )}
      </div>

      {/* Share Modal overlay */}
      {showShareModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md" onClick={() => setShowShareModal(false)}>
          <div className="bg-white dark:bg-dark-900 border border-gray-300/20 dark:border-white/[0.06] rounded-3xl p-6.5 max-w-md w-full shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg text-gray-800 dark:text-dark-100 mb-1 tracking-wide">Compartir nota</h3>
            <p className="text-xs text-gray-400 dark:text-dark-500 mb-5 font-medium">Comparte &quot;{note.title}&quot; con otro usuario</p>
            <form onSubmit={handleShare} className="space-y-4.5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Email del usuario</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-dark-500" />
                  <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@ejemplo.com" className="input-field pl-9.5 font-medium" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-1.5">Permiso</label>
                <select value={sharePermission} onChange={(e) => setSharePermission(e.target.value)} className="input-field font-semibold">
                  <option value="read">Solo lectura</option>
                  <option value="edit">Puede editar</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowShareModal(false)} className="btn-secondary flex-1 font-bold">Cancelar</button>
                <Button type="submit" isLoading={sharing} className="flex-1 font-bold">Compartir</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteCard;
