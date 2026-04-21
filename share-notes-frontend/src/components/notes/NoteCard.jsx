import { useState } from "react";
import { Maximize2, Copy, X, Pin, Trash2, Pencil, Star, Download, FileText, Check, Sparkles } from "lucide-react";
import Badge from "../ui/Badge.jsx";
import Tooltip from "../ui/Tooltip.jsx";
import { exportToPDF } from "../../utils/exportPDF.js";
import toast from "react-hot-toast";

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onToggleFavorite, onDownload, external = false, onRate, showAuthor = false, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

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
          className={`w-4 h-4 transition-transform hover:scale-125 ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"} ${onRate ? "hover:text-yellow-400 cursor-pointer" : ""}`}
        >
          <Star className="w-4 h-4" fill="currentColor" />
        </button>
      );
    }
    return stars;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopied(true);
      toast.success("📋 Copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{note.title}</h2>
            {note.isPinned && <span className="text-xl">📌</span>}
            {note.isFavorite && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-sm font-medium text-gray-700 dark:text-gray-300">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <button onClick={() => exportToPDF(note)} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl flex items-center gap-2 transition-all hover:scale-105 text-sm font-medium text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4" /> PDF
            </button>
            <button onClick={() => setExpanded(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-110 text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50/50 to-purple-50/30 dark:from-gray-950/50 dark:to-purple-950/10">
          <div className="max-w-3xl mx-auto">
            {note.category && (
              <Badge label={note.category.name} color={note.category.color} className="mb-6 animate-slide-up" />
            )}
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-lg leading-relaxed animate-fade-in text-gray-700 dark:text-gray-300">
              {note.content}
            </div>
            {note.description && (
              <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-slide-up delay-100">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Resumen</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{note.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 ${note.isPinned ? "ring-2 ring-indigo-500/30" : ""} ${note.isFavorite ? "ring-2 ring-yellow-400/30" : ""} animate-scale-in`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {note.isPinned && <span className="text-xs animate-bounce-subtle">📌</span>}
          <h3 className="font-bold text-xl leading-snug text-gray-900 dark:text-white line-clamp-2 flex-1">{note.title}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Tooltip text="Expandir">
            <button onClick={() => setExpanded(true)} className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-all hover:scale-110">
              <Maximize2 className="w-4 h-4" />
            </button>
          </Tooltip>
          {!external && (
            <>
              <Tooltip text={note.isPinned ? "Desfijar" : "Fijar"}>
                <button onClick={() => onTogglePin(note._id)} className={`p-2 rounded-xl transition-all hover:scale-110 ${note.isPinned ? "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"}`}>
                  <Pin className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text={note.isFavorite ? "Quitar favorito" : "Agregar favorito"}>
                <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-2 rounded-xl transition-all hover:scale-110 ${note.isFavorite ? "text-yellow-500 fill-yellow-500 bg-yellow-50 dark:bg-yellow-900/30" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"}`}>
                  <Star className={`w-4 h-4 ${note.isFavorite ? "fill-current" : ""}`} />
                </button>
              </Tooltip>
              <Tooltip text="Editar">
                <button onClick={() => onEdit(note)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all hover:scale-110">
                  <Pencil className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="Eliminar">
                <button onClick={() => onDelete(note._id)} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all hover:scale-110">
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>
            </>
          )}
          {external && (
            <>
              <Tooltip text="Marcar favorito">
                <button onClick={() => onToggleFavorite && onToggleFavorite(note._id)} className={`p-2 rounded-xl transition-all hover:scale-110 ${note.isFavorite ? "text-yellow-500 fill-yellow-500 bg-yellow-50" : "hover:bg-gray-100 text-gray-400"}`}>
                  <Star className={`w-4 h-4 ${note.isFavorite ? "fill-current" : ""}`} />
                </button>
              </Tooltip>
              <Tooltip text="Descargar">
                <button onClick={() => onDownload && onDownload(note._id)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all hover:scale-110">
                  <Download className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip text="Exportar PDF">
                <button onClick={() => exportToPDF(note)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all hover:scale-110">
                  <FileText className="w-4 h-4" />
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {note.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">{note.description}</p>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed flex-1">{note.content}</p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {note.category && <Badge label={note.category.name} color={note.category.color} />}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {external && (
            <>
              <div className="flex items-center gap-1">{renderStars()}</div>
              <div className="flex items-center gap-1"><Download className="w-3 h-3" />{note.downloads}</div>
            </>
          )}
          <span className="text-gray-400">{date}</span>
        </div>
      </div>

      {external && showAuthor && note.user && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
          {note.user.avatar ? (
            <img src={note.user.avatar} alt={note.user.name} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-medium text-white">
              {note.user.name?.charAt(0)}
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">Por {note.user.name}</span>
        </div>
      )}
    </div>
  );
};

export default NoteCard;