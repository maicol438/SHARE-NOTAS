import { LucideIcon } from 'lucide-react';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  id?: string;
  className?: string;
}

const Input = ({ label, error, icon: Icon, id, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-1">
    {label && <label htmlFor={id} className="text-sm font-medium text-gray-600 dark:text-slate-300">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />}
      <input id={id} className={`input-field ${Icon ? 'pl-9' : ''} ${error ? 'border-red-500/50 focus:ring-red-500/20' : ''} ${className}`} {...props} />
    </div>
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

export default Input;
