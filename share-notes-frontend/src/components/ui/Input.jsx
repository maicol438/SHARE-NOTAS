const Input = ({ label, error, icon: Icon, className = "", ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-semibold text-gray-700 dark:text-dark-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        )}
        <input
          className={`input-field ${Icon ? "pl-9" : ""} ${error ? "border-red-400 focus:ring-red-400/30" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default Input;
