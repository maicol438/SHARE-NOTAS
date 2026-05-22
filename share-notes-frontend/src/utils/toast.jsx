import toast from "react-hot-toast";

export const showToast = (message, type = "success", options = {}) => {
  const { duration = 3000, ...rest } = options;

  const icons = {
    success: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  };

  const borderColors = {
    success: "border-emerald-500/30 dark:border-emerald-500/20",
    error: "border-red-500/30 dark:border-red-500/20",
    info: "border-blue-500/30 dark:border-blue-500/20",
  };

  const iconColors = {
    success: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/20",
    error: "text-red-500 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 border-red-500/20",
    info: "text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/20",
  };

  toast.custom(
    (t) => (
      <div
        className={`
          relative flex items-center gap-3.5 px-4.5 py-4 rounded-2xl min-w-[320px] max-w-md
          bg-white/90 dark:bg-dark-900/90
          backdrop-blur-2xl
          border ${borderColors[type] || borderColors.success}
          shadow-xl shadow-primary-500/[0.05] dark:shadow-black/40
          transition-all duration-300
          ${t.visible ? "animate-scale-in" : "animate-fade-out opacity-0"}
        `}
      >
        {/* Glow behind the icon depending on type */}
        <div className={`absolute left-4 w-8 h-8 rounded-xl blur-lg opacity-40 pointer-events-none ${
          type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
        }`} />

        <span className={`relative flex items-center justify-center w-9 h-9 rounded-xl border flex-shrink-0 ${iconColors[type] || iconColors.success}`}>
          {icons[type] || icons.success}
        </span>

        <span className="flex-1 text-gray-800 dark:text-gray-100 text-sm font-semibold leading-tight">{message}</span>

        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-400 dark:text-dark-500 hover:text-gray-600 dark:hover:text-dark-300 transition-all flex-shrink-0 cursor-pointer border-none"
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    ),
    { duration, ...rest }
  );
};

export default showToast;