import { FileText, Search, Star, Trash2, Plus, Inbox, BookOpen, FolderOpen } from "lucide-react";
import Button from "./Button.jsx";

const icons = {
  notes: Inbox,
  search: Search,
  favorites: Star,
  trash: Trash2,
  category: FolderOpen,
  explore: BookOpen,
};

const defaultConfig = {
  notes: {
    title: "Tu espacio está vacío",
    subtitle: "Empieza a crear tus primeras notas organizadas por categorías",
    actionLabel: "Crear primera nota",
  },
  search: {
    title: "Sin resultados",
    subtitle: "No encontramos lo que buscabas",
    actionLabel: null,
  },
  favorites: {
    title: "Sin favoritos",
    subtitle: "Marca notas como favoritas para verlas aquí",
    actionLabel: null,
  },
  trash: {
    title: "La papelera está vacía",
    subtitle: "Las notas eliminadas aparecerán aquí",
    actionLabel: null,
  },
  category: {
    title: "Sin notas en esta categoría",
    subtitle: "¡Crea tu primera nota para esta materia!",
    actionLabel: "Crear nota",
  },
  explore: {
    title: "No hay notas públicas",
    subtitle: "Sé el primero en compartir tus apuntes",
    actionLabel: null,
  },
};

const gradients = {
  notes: "from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30",
  search: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
  favorites: "from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30",
  trash: "from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30",
  category: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
  explore: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
};

const borders = {
  notes: "border-indigo-100 dark:border-indigo-900/30",
  search: "border-amber-100 dark:border-amber-900/30",
  favorites: "border-yellow-100 dark:border-yellow-900/30",
  trash: "border-gray-200 dark:border-gray-700",
  category: "border-violet-100 dark:border-violet-900/30",
  explore: "border-blue-100 dark:border-blue-900/30",
};

const iconColors = {
  notes: "text-indigo-400",
  search: "text-amber-400",
  favorites: "text-yellow-400",
  trash: "text-gray-400",
  category: "text-violet-400",
  explore: "text-blue-400",
};

export default function EmptyState({ type = "notes", title, subtitle, actionLabel, onAction, className = "" }) {
  const config = defaultConfig[type] || defaultConfig.notes;
  const Icon = icons[type] || icons.notes;
  
  return (
    <div className={`flex flex-col items-center justify-center py-20 px-6 animate-fade-in ${className}`}>
      <div 
        className={`
          w-24 h-24 rounded-full flex items-center justify-center 
          bg-gradient-to-br ${gradients[type]} 
          border ${borders[type]}
          mb-6
        `}
      >
        <Icon className={`w-10 h-10 ${iconColors[type]}`} />
      </div>

      <div className="text-center max-w-sm">
        <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-2">
          {title || config.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle || config.subtitle}
        </p>
      </div>

      {(actionLabel !== null || config.actionLabel) && onAction && (
        <Button 
          onClick={onAction} 
          icon={Plus}
          className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          {actionLabel || config.actionLabel}
        </Button>
      )}
    </div>
  );
}