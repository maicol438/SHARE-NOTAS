import { useState, useRef, useEffect, ReactNode } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: Position;
}

const Tooltip = ({ children, text, position = 'top' as Position }: TooltipProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [actualPosition, setActualPosition] = useState<Position>(position);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && wrapperRef.current) {
      const rect: DOMRect = wrapperRef.current.getBoundingClientRect();
      const threshold: number = 150;
      if (rect.top < threshold && actualPosition === 'top') setActualPosition('bottom');
      else if (rect.bottom > window.innerHeight - threshold && actualPosition === 'bottom') setActualPosition('top');
      else if (rect.left < threshold && actualPosition === 'left') setActualPosition('right');
      else if (rect.right > window.innerWidth - threshold && actualPosition === 'right') setActualPosition('left');
      else setActualPosition(position);
    }
  }, [visible, position, actualPosition]);

  const positions: Record<Position, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-gray-100 dark:text-slate-200 bg-gray-800 dark:bg-white/[0.05] border border-gray-700 dark:border-white/[0.08] rounded-lg whitespace-nowrap pointer-events-none shadow-tesla-lg animate-fade-in-fast ${positions[actualPosition]}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
