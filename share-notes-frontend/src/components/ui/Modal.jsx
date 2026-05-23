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
      {/* Backdrop with deep blur */}
      <div 
        className="fixed inset-0 transition-opacity duration-300 animate-fade-in" 
        style={{
          background: "rgba(5, 5, 15, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
        onClick={handleOverlayClick} 
      />
      
      {/* Modal Container with neon border */}
      <div className={`relative w-full ${sizes[size]} mx-auto z-10 animate-scale-in`}>
        <div className="card-neon">
          <div className="card-neon-inner rounded-3xl p-6">
          {/* Top accent line */}
          <div 
            className="absolute top-0 left-1/4 right-1/4 h-[1px] pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), transparent)",
            }}
          />
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
            <h2 className="text-lg font-bold gradient-text tracking-tight">
              {title}
            </h2>
            
            <button 
              onClick={onClose} 
              className="p-2 rounded-full transition-all duration-300 active:scale-95"
              style={{
                color: "rgba(161,161,170,0.7)",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.15)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(124,58,237,0.2)";
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)";
                e.currentTarget.style.color = "#e2e8f0";
                e.currentTarget.style.transform = "rotate(90deg) scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(124,58,237,0.08)";
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.15)";
                e.currentTarget.style.color = "rgba(161,161,170,0.7)";
                e.currentTarget.style.transform = "rotate(0deg) scale(1)";
              }}
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content Body */}
          <div className="relative max-h-[80vh] overflow-y-auto" style={{ color: "#c4b5fd" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default memo(Modal);
