import { useEffect, useCallback, memo, ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' as ModalSize }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const sizes: Record<ModalSize, string> = { 
    sm: 'max-w-sm', 
    md: 'max-w-lg', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-md animate-fade-in"
        onClick={handleOverlayClick} 
      />
      
      <div className={`relative w-full ${sizes[size]} mx-auto z-10 animate-scale-in`}>
        <div className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.08] rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/50 overflow-hidden">
          <div className="relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/[0.06]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h2>
              
              <button 
                onClick={onClose} 
                className="p-2 rounded-full text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-200 bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] border border-gray-200 dark:border-white/[0.06] transition-all active:scale-95"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto text-gray-700 dark:text-slate-300">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Modal);
