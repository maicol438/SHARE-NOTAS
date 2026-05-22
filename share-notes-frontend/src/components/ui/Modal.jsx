import { useEffect, useCallback, memo } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const sizes = { 
    sm: "max-w-sm", 
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* High-fidelity Backdrop with deep blur */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in" 
        onClick={handleOverlayClick} 
      />
      
      {/* Sleek Glassmorphic Modal Container */}
      <div 
        className={`relative w-full ${sizes[size]} 
        bg-white/95 dark:bg-dark-900/90 
        backdrop-blur-2xl
        border border-gray-200/60 dark:border-white/[0.08] 
        rounded-2xl sm:rounded-3xl p-6 
        shadow-2xl shadow-black/10 dark:shadow-black/50
        mx-auto z-10 
        transform animate-scale-in transition-all duration-300 ease-tesla`}
      >
        {/* Soft internal gradient glows for techy premium look */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary-500/30 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-150/60 dark:border-white/[0.04]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-dark-100 tracking-tight">
            {title}
          </h2>
          
          {/* Close button with circular hover glow */}
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-gray-400 dark:text-dark-500 
            hover:text-gray-700 dark:hover:text-dark-200 
            bg-gray-50/50 dark:bg-dark-800/40 
            border border-transparent hover:border-gray-200 dark:hover:border-white/[0.08]
            hover:rotate-90 hover:scale-105 active:scale-95
            transition-all duration-300 ease-tesla"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content Body */}
        <div className="relative text-gray-700 dark:text-dark-300 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default memo(Modal);
