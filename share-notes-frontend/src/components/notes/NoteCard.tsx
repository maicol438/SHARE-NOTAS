import { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Pin,
  Trash2,
  Edit3,
  MoreHorizontal,
  Share2,
} from 'lucide-react';
import Badge from '../ui/Badge';

interface Category {
  _id: string;
  name: string;
  color?: string;
}

interface Note {
  _id: string;
  title: string;
  content?: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  category?: Category;
  tags?: string[];
  createdAt: string;
}

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onShare?: (note: Note) => void;
  onDownload?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  showAuthor?: boolean;
  external?: boolean;
  index?: number;
}

const NoteCard = ({ note, onEdit, onDelete, onTogglePin, onToggleFavorite, onShare }: NoteCardProps) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleTogglePin = useCallback(() => onTogglePin?.(note._id), [note._id, onTogglePin]);
  const handleToggleFavorite = useCallback(() => onToggleFavorite?.(note._id), [note._id, onToggleFavorite]);
  const handleDelete = useCallback(() => onDelete?.(note._id), [note._id, onDelete]);
  const handleEdit = useCallback(() => onEdit?.(note), [note, onEdit]);
  const handleShare = useCallback(() => onShare?.(note), [note, onShare]);
  const handleMenuToggle = useCallback(() => setShowMenu((p) => !p), []);
  const handleMenuClose = useCallback(() => setShowMenu(false), []);

  const preview: string = note.content
    ? note.content.replace(/<[^>]*>/g, '').slice(0, 150)
    : '';

  return (
    <div
      className="group relative bg-white dark:bg-dark-800/80 rounded-2xl border border-gray-200/60 dark:border-white/[0.06] p-5 hover:shadow-lg hover:shadow-primary-500/5 dark:hover:shadow-2xl dark:hover:shadow-black/30 hover:border-primary-300/40 dark:hover:border-primary-500/20 transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link to={`/dashboard?note=${note._id}`} className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-[15px] leading-snug">
            {note.isPinned && <Pin className="w-3.5 h-3.5 inline mr-1 text-primary-500 -mt-0.5" />}
            {note.title || 'Sin título'}
          </h3>
        </Link>
        <div className="relative flex-shrink-0">
          <button
            onClick={handleMenuToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Más opciones"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={handleMenuClose} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-xl dark:shadow-2xl py-1 min-w-[150px] animate-scale-in">
                {onEdit && <MenuItem icon={Edit3} label="Editar" onClick={handleEdit} />}
                {onTogglePin && <MenuItem icon={Pin} label={note.isPinned ? 'Desfijar' : 'Fijar'} onClick={handleTogglePin} />}
                {onToggleFavorite && <MenuItem icon={Star} label={note.isFavorite ? 'Quitar favorito' : 'Favorito'} onClick={handleToggleFavorite} />}
                {onShare && <MenuItem icon={Share2} label="Compartir" onClick={handleShare} />}
                {onDelete && <MenuItem icon={Trash2} label="Eliminar" onClick={handleDelete} danger />}
              </div>
            </>
          )}
        </div>
      </div>

      {preview && (
        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-3">
          {preview}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {note.category && (
            <Badge label={note.category.name} color={note.category.color} />
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {note.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
        </div>
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const MenuItem = ({ icon: Icon, label, onClick, danger }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-all ${
      danger
        ? 'text-red-500 dark:text-red-400 hover:bg-red-500/10'
        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default memo(NoteCard);
