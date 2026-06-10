import { Loader2, LucideIcon } from 'lucide-react';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: LucideIcon;
  className?: string;
}

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: '',
  lg: 'text-base px-6 py-3',
};

const Button = ({
  children,
  variant = 'primary' as Variant,
  size = 'md' as Size,
  isLoading = false,
  icon: Icon,
  className = '',
  ...props
}: ButtonProps) => (
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
