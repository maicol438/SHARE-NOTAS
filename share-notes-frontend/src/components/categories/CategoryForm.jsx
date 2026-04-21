import { useState } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import useNoteStore from "../../stores/useNoteStore.js";
import toast from "react-hot-toast";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

const CategoryForm = ({ onClose }) => {
  const { createCategory } = useNoteStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("El nombre es obligatorio");
    setIsLoading(true);
    const result = await createCategory({ name, color });
    setIsLoading(false);
    if (result.ok) {
      toast.success("Categoría creada ✓");
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Matemáticas"
        maxLength={50}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110" : ""}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit" isLoading={isLoading}>Crear categoría</Button>
      </div>
    </form>
  );
};

export default CategoryForm;
