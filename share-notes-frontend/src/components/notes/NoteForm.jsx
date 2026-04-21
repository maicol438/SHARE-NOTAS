import { useState, useEffect } from "react";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import useNoteStore from "../../stores/useNoteStore.js";
import toast from "react-hot-toast";

const NoteForm = ({ note, onClose }) => {
  const { categories, createNote, updateNote, createCategory, isLoading } = useNoteStore();
  const isEdit = !!note;

  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || "",
    description: note?.description || "",
    category: note?.category?._id || "",
    isPinned: note?.isPinned || false,
  });

  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    if (categories.length === 0) {
      createCategory({ name: "General", color: "#6366f1" }).then(() => {});
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      toast.error("Ingresa un nombre para la categoría");
      return;
    }
    const result = await createCategory({ name: newCategory.trim() });
    if (result.ok) {
      setForm((prev) => ({ ...prev, category: result.category._id }));
      setNewCategory("");
      setShowNewCategory(false);
      toast.success("Categoría creada");
    } else {
      toast.error(result.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim() || !form.category) {
      toast.error("Completa todos los campos");
      return;
    }

    const result = isEdit ? await updateNote(note._id, form) : await createNote(form);

    if (result.ok) {
      toast.success(isEdit ? "✅ Nota actualizada correctamente" : "📝 Nota creada con éxito!");
      onClose();
    } else {
      toast.error(`⚠️ ${result.message || "Algo salió mal. Intenta de nuevo."}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Título" name="title" value={form.title} onChange={handleChange} placeholder="Ej: Apuntes de Cálculo" maxLength={120} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resumen breve / Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Breve descripción de la nota..." className="input-field resize-none" maxLength={500} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contenido</label>
        <textarea name="content" value={form.content} onChange={handleChange} rows={5} placeholder="Escribe el contenido de tu nota..." className="input-field resize-none" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
        {showNewCategory ? (
          <div className="flex gap-2">
            <Input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nueva categoría" className="flex-1" />
            <Button type="button" variant="secondary" onClick={handleCreateCategory}>Agregar</Button>
            <Button type="button" variant="ghost" onClick={() => setShowNewCategory(false)}>Cancelar</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select name="category" value={form.category} onChange={handleChange} className="input-field flex-1">
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
            <Button type="button" variant="secondary" onClick={() => setShowNewCategory(true)}>+ Nueva</Button>
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleChange} className="w-4 h-4 rounded text-primary-600" />
        <span className="text-gray-700 dark:text-gray-300">Fijar nota</span>
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit" isLoading={isLoading}>{isEdit ? "Guardar cambios" : "Crear nota"}</Button>
      </div>
    </form>
  );
};

export default NoteForm;