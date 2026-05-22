import { useState, useRef, useEffect } from "react";

const Tooltip = ({ children, text, position = "top" }) => {
  const [visible, setVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (visible && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const threshold = 150;
      if (rect.top < threshold && actualPosition === "top") setActualPosition("bottom");
      else if (rect.bottom > window.innerHeight - threshold && actualPosition === "bottom") setActualPosition("top");
      else if (rect.left < threshold && actualPosition === "left") setActualPosition("right");
      else if (rect.right > window.innerWidth - threshold && actualPosition === "right") setActualPosition("left");
      else setActualPosition(position);
    }
  }, [visible, position]);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div ref={wrapperRef} className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-surface-200 bg-surface-800 border border-surface-700 rounded-lg whitespace-nowrap pointer-events-none shadow-tesla-lg animate-fade-in-fast ${positions[actualPosition]}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;