import { FileText, Search, Star, Trash2, Plus, Inbox, BookOpen, FolderOpen, Sparkles, Lightbulb } from "lucide-react";
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
    icon: Sparkles,
    title: "Tu espacio está vacío",
    subtitle: "Empieza a crear tus primeras notas organizadas por categorías",
    tips: ["Usa carpetas para organizar tus materias", "Fija las notas importantes", "Comparte con compañeros"],
    actionLabel: "Crear primera nota",
  },
  search: {
    icon: Search,
    title: "Sin resultados",
    subtitle: "No encontramos lo que buscabas. Intenta con otras palabras.",
    tips: [],
    actionLabel: null,
  },
  favorites: {
    icon: Star,
    title: "Sin favoritos",
    subtitle: "Marca notas como favoritas para verlas aquí",
    tips: ["Haz clic en el ícono de estrella en cualquier nota"],
    actionLabel: null,
  },
  trash: {
    icon: Trash2,
    title: "La papelera está vacía",
    subtitle: "Las notas eliminadas aparecerán aquí",
    tips: [],
    actionLabel: null,
  },
  category: {
    icon: FolderOpen,
    title: "Sin notas en esta categoría",
    subtitle: "¡Crea tu primera nota para esta materia!",
    tips: [],
    actionLabel: "Crear nota",
  },
  explore: {
    icon: BookOpen,
    title: "No hay notas públicas",
    subtitle: "Sé el primero en compartir tus apuntes",
    tips: [],
    actionLabel: null,
  },
};

const gradients = {
  notes: "from-indigo-500 to-purple-600",
  search: "from-amber-500 to-orange-600",
  favorites: "from-yellow-500 to-amber-600",
  trash: "from-gray-500 to-slate-600",
  category: "from-violet-500 to-purple-600",
  explore: "from-blue-500 to-cyan-600",
};

export default function EmptyState({ type = "notes", title, subtitle, actionLabel, onAction, className = "" }) {
  const config = defaultConfig[type] || defaultConfig.notes;
  const Icon = icons[type] || icons.notes;
  const IconBg = config.icon || Icon;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 animate-fade-in ${className}`}>
      <div className="relative mb-6">
        <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${gradients[type]} flex items-center justify-center shadow-lg animate-float`}>
          <IconBg className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-dark-900">
          <Icon className={`w-4 h-4 ${type === "notes" ? "text-indigo-500" : type === "favorites" ? "text-yellow-500" : type === "trash" ? "text-gray-500" : type === "search" ? "text-amber-500" : "text-blue-500"}`} />
        </div>
      </div>

      <div className="text-center max-w-sm">
        <h3 className="font-extrabold text-xl text-gray-900 dark:text-gray-100 mb-2">
          {title || config.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {subtitle || config.subtitle}
        </p>
        {config.tips?.length > 0 && (
          <div className="space-y-2">
            {config.tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <Lightbulb className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(actionLabel !== null || config.actionLabel) && onAction && (
        <Button
          onClick={onAction}
          icon={Plus}
          className="mt-6 bg-gradient-to-r from-primary-500 to-purple-600 hover:from-primary-600 hover:to-purple-700 text-white border-none shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 transition-all hover:scale-105"
        >
          {actionLabel || config.actionLabel}
        </Button>
      )}
    </div>
  );
}