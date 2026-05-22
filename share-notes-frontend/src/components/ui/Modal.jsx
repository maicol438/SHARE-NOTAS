import { useEffect, useCallback, memo } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleOverlayClick} />
      <div className={`relative bg-surface-900 border border-surface-700 rounded-xl w-full ${sizes[size]} p-5 shadow-tesla-lg mx-auto animate-scale-in`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-surface-100">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-800 text-surface-500 hover:text-surface-300 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default memo(Modal);
