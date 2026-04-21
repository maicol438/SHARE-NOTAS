import { Loader2 } from "lucide-react";

const Spinner = ({ size = "md", label = "Cargando..." }) => {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
};

export default Spinner;
