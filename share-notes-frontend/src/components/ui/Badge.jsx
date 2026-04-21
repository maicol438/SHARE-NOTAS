const categoryColors = {
  Matemáticas: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Programación: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Física: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Química: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Historia: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Literatura: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Biología: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  General: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

const getCategoryStyle = (categoryName, customColor) => {
  if (customColor) {
    return { backgroundColor: customColor, color: "#fff" };
  }
  const key = Object.keys(categoryColors).find(k => 
    categoryName?.toLowerCase().includes(k.toLowerCase())
  );
  return categoryColors[key] || categoryColors["General"];
};

const Badge = ({ label, color, onRemove }) => {
  const styleClass = getCategoryStyle(label, color);
  
  const isHexColor = (c) => /^#[0-9A-Fa-f]{6}$/.test(c);
  
  if (isHexColor(color)) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {label}
        {onRemove && (
          <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
            ×
          </button>
        )}
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${styleClass}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
          ×
        </button>
      )}
    </span>
  );
};

export default Badge;
