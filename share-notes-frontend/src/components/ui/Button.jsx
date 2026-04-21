import { Loader2 } from "lucide-react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors",
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
  icon: Icon,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
