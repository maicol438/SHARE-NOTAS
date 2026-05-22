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

  const borders = {
    success: "border-emerald-500/40",
    error: "border-red-500/40",
    info: "border-blue-500/40",
  };

  const colors = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400",
  };

  const gradients = {
    success: "from-emerald-500/10 to-emerald-600/5",
    error: "from-red-500/10 to-red-600/5",
    info: "from-blue-500/10 to-blue-600/5",
  };

  toast.custom(
    (t) => (
      <div
        className={`
          relative flex items-center gap-3 px-4 py-3.5 pr-4 rounded-2xl min-w-[320px] max-w-md
          bg-neutral-900/95 dark:bg-neutral-900/95
          border ${borders[type] || borders.success}
          text-white text-sm font-medium
          shadow-2xl shadow-black/40
          ${t.visible ? "animate-slide-in-right" : "animate-fade-in"}
          backdrop-blur-xl
        `}
      >
        <span className={`flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 ${colors[type] || colors.success}`}>
          {icons[type] || icons.success}
        </span>
        <span className="flex-1 text-white/90 leading-tight">{message}</span>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-all flex-shrink-0 cursor-pointer border-none"
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