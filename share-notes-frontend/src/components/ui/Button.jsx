import { Loader2 } from "lucide-react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
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
}) => (
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
    {!isLoading && children}
  </button>
);

export default Button;
