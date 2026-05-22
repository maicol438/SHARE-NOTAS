import { Search, Star, Trash2, Plus, Inbox, BookOpen, FolderOpen, Sparkles, Lightbulb } from "lucide-react";
import Button from "./Button.jsx";

const icons = {
  notes: Inbox, search: Search, favorites: Star, trash: Trash2, category: FolderOpen, explore: BookOpen,
};

const defaultConfig = {
  notes: {
    icon: Sparkles, title: "Tu espacio está vacío", subtitle: "Empieza a crear tus primeras notas organizadas por categorías",
    tips: ["Usa carpetas para organizar tus materias", "Fija las notas importantes", "Comparte con compañeros"], actionLabel: "Crear primera nota",
  },
  search: { icon: Search, title: "Sin resultados", subtitle: "No encontramos lo que buscabas. Intenta con otras palabras.", tips: [], actionLabel: null },
  favorites: { icon: Star, title: "Sin favoritos", subtitle: "Marca notas como favoritas para verlas aquí", tips: ["Haz clic en el ícono de estrella en cualquier nota"], actionLabel: null },
  trash: { icon: Trash2, title: "La papelera está vacía", subtitle: "Las notas eliminadas aparecerán aquí", tips: [], actionLabel: null },
  category: { icon: FolderOpen, title: "Sin notas en esta categoría", subtitle: "¡Crea tu primera nota para esta materia!", tips: [], actionLabel: "Crear nota" },
  explore: { icon: BookOpen, title: "No hay notas públicas", subtitle: "Sé el primero en compartir tus apuntes", tips: [], actionLabel: null },
};

export default function EmptyState({ type = "notes", title, subtitle, actionLabel, onAction, className = "" }) {
  const config = defaultConfig[type] || defaultConfig.notes;
  const IconBg = config.icon || icons[type] || icons.notes;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 animate-fade-in ${className}`}>
      <div className="mb-5">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center">
          <IconBg className="w-7 h-7 text-surface-400" />
        </div>
      </div>
      <div className="text-center max-w-sm">
        <h3 className="font-semibold text-base text-surface-200 mb-1">{title || config.title}</h3>
        <p className="text-sm text-surface-500 mb-4">{subtitle || config.subtitle}</p>
        {config.tips?.length > 0 && (
          <div className="space-y-1.5">
            {config.tips.map((tip, i) => (
              <div key={i} className="flex items-center justify-center gap-1.5 text-xs text-surface-500">
                <Lightbulb className="w-3 h-3 text-primary-400 flex-shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {(actionLabel !== null || config.actionLabel) && onAction && (
        <Button onClick={onAction} icon={Plus} className="mt-5">{actionLabel || config.actionLabel}</Button>
      )}
    </div>
  );
}