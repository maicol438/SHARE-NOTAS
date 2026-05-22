import { Search, Star, Trash2, Plus, Inbox, BookOpen, FolderOpen, Sparkles, Lightbulb } from "lucide-react";
import Button from "./Button.jsx";

const icons = {
  notes: Sparkles,
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
    tips: [
      "Usa carpetas para organizar tus materias",
      "Fija las notas más importantes",
      "Comparte y colabora en tiempo real"
    ],
    actionLabel: "Crear primera nota",
  },
  search: {
    icon: Search,
    title: "Sin resultados",
    subtitle: "No encontramos lo que buscabas. Intenta con otras palabras clave.",
    tips: [
      "Verifica la ortografía",
      "Prueba con palabras más generales",
      "Filtra por una categoría diferente"
    ],
    actionLabel: null
  },
  favorites: {
    icon: Star,
    title: "Sin favoritos",
    subtitle: "Marca tus notas importantes como favoritas para tenerlas siempre a mano",
    tips: [
      "Haz clic en el ícono de estrella en cualquier nota",
      "Ideal para resúmenes de exámenes",
      "Acceso directo rápido desde el menú"
    ],
    actionLabel: null
  },
  trash: {
    icon: Trash2,
    title: "La papelera está vacía",
    subtitle: "Las notas eliminadas aparecerán aquí antes de borrarse definitivamente",
    tips: [
      "Las notas aquí no ocupan espacio",
      "Puedes restaurar tus notas en cualquier momento",
      "El historial está protegido"
    ],
    actionLabel: null
  },
  category: {
    icon: FolderOpen,
    title: "Sin notas en esta categoría",
    subtitle: "¡Organiza tu materia creando la primera nota aquí!",
    tips: [
      "Perfecto para separar semestres",
      "Agrega etiquetas personalizadas",
      "Exporta las notas de esta carpeta"
    ],
    actionLabel: "Crear nota"
  },
  explore: {
    icon: BookOpen,
    title: "No hay notas públicas",
    subtitle: "Sé el primero en compartir tus apuntes con la comunidad",
    tips: [
      "El conocimiento libre ayuda a todos",
      "Recibe comentarios de otros estudiantes",
      "Inspírate con el material de estudio compartido"
    ],
    actionLabel: null
  },
};

export default function EmptyState({ type = "notes", title, subtitle, actionLabel, onAction, className = "" }) {
  const config = defaultConfig[type] || defaultConfig.notes;
  const IconBg = config.icon || icons[type] || icons.notes;

  return (
    <div className={`relative flex flex-col items-center justify-center py-16 px-6 text-center animate-slide-up rounded-3xl overflow-hidden bg-gray-50/50 dark:bg-dark-900/30 border border-gray-150/40 dark:border-white/[0.03] backdrop-blur-md max-w-xl mx-auto shadow-sm ${className}`}>
      
      {/* Decorative background glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none dark:bg-primary-500/5"></div>
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none dark:bg-purple-500/5"></div>

      {/* Floating Animated Icon Container */}
      <div className="relative mb-6 group">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-primary-500/20 dark:bg-primary-500/10 rounded-2xl blur-xl group-hover:scale-125 transition-transform duration-500 ease-tesla"></div>
        
        {/* The Glass Icon Box */}
        <div className="relative w-16 h-16 rounded-2xl bg-white/80 dark:bg-dark-800/80 border border-gray-200/60 dark:border-white/[0.08] shadow-md dark:shadow-2xl flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300 ease-tesla">
          <IconBg className="w-8 h-8 text-primary-500 dark:text-primary-400 animate-float" />
        </div>
        
        {/* Small decorative sparkle */}
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
        </span>
      </div>

      {/* Typography */}
      <div className="max-w-md mb-6 z-10">
        <h3 className="text-xl font-bold text-gray-800 dark:text-dark-100 tracking-tight mb-2">
          {title || config.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-400 leading-relaxed font-medium">
          {subtitle || config.subtitle}
        </p>
      </div>

      {/* Modern styled suggestion tips */}
      {config.tips?.length > 0 && (
        <div className="w-full max-w-sm mb-8 space-y-2.5 z-10">
          <div className="text-2xs font-extrabold tracking-wider text-gray-400 dark:text-dark-500 uppercase flex items-center justify-center gap-1.5 mb-3">
            <span className="h-[1px] w-4 bg-gray-200 dark:bg-dark-700"></span>
            <span>Consejos Útiles</span>
            <span className="h-[1px] w-4 bg-gray-200 dark:bg-dark-700"></span>
          </div>
          
          <div className="grid gap-2 text-left">
            {config.tips.map((tip, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 rounded-xl bg-white/40 dark:bg-dark-850/40 border border-gray-150/50 dark:border-white/[0.02] hover:border-gray-200 dark:hover:border-white/[0.05] transition-all duration-200 ease-tesla group"
              >
                <div className="w-5 h-5 rounded-lg bg-primary-50/80 dark:bg-primary-950/20 border border-primary-100/50 dark:border-primary-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <Lightbulb className="w-3 h-3 text-primary-500 dark:text-primary-400" />
                </div>
                <span className="text-xs text-gray-600 dark:text-dark-300 leading-normal font-medium">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      {(actionLabel !== null || config.actionLabel) && onAction && (
        <div className="z-10 animate-fade-in">
          <Button 
            onClick={onAction} 
            icon={Plus} 
            className="shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-tesla"
          >
            {actionLabel || config.actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}