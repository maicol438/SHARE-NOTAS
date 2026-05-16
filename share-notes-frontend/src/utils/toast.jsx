import toast from "react-hot-toast";

const DismissBtn = ({ t }) => (
  <button
    onClick={() => toast.dismiss(t.id)}
    className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-white/20 text-white/80 hover:bg-white/30 cursor-pointer text-xs leading-none p-0 border-none transition-all"
    aria-label="Cerrar"
  >
    ✕
  </button>
);

const icons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const gradients = {
  success: "from-emerald-500 to-green-600",
  error: "from-red-500 to-rose-600",
  info: "from-blue-500 to-indigo-600",
  warning: "from-amber-500 to-orange-600",
};

export const showToast = (message, type = "success", options = {}) => {
  const { duration = 2500, ...rest } = options;
  toast.custom(
    (t) => (
      <div
        className={`
          relative flex items-center gap-2.5 px-4 py-3 pr-8 rounded-2xl shadow-2xl
          text-white font-semibold text-sm font-sans
          bg-gradient-to-r ${gradients[type] || gradients.success}
          ${t.visible ? "animate-slide-in-right" : "animate-fade-in"}
          backdrop-blur-sm
        `}
      >
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 flex-shrink-0 animate-pop-in">
          {icons[type] || icons.success}
        </span>
        <span className="drop-shadow-sm">{message}</span>
        <DismissBtn t={t} />
      </div>
    ),
    { duration, ...rest }
  );
};

export default showToast;