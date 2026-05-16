import { Loader2, Check } from "lucide-react";
import { useState } from "react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-all",
};

const sizes = {
  sm: "text-xs px-3 py-1.5",
  md: "",
  lg: "text-base px-6 py-3",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  showSuccess = false,
  icon: Icon,
  className = "",
  ...props
}) => {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    if (props.onClick) props.onClick(e);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
  };

  return (
    <button
      className={`relative overflow-hidden ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/30 animate-pop-in pointer-events-none"
          style={{
            left: r.x - 8,
            top: r.y - 8,
            width: 16,
            height: 16,
          }}
        />
      ))}
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin transition-all" />
      ) : showSuccess ? (
        <span className="flex items-center gap-2 animate-pop-in">
          <Check className="w-4 h-4" />
          {children}
        </span>
      ) : Icon ? (
        <Icon className="w-4 h-4 transition-all" />
      ) : null}
      {!isLoading && !showSuccess && children}
    </button>
  );
};

export default Button;
