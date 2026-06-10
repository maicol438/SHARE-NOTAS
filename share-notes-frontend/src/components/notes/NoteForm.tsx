import { useState, useEffect } from 'react';
import { X, Save, Tag, FolderOpen } from 'lucide-react';
import Button from '../ui/Button';
import RichTextEditor from '../ui/RichTextEditor';

interface Category {
  _id: string;
  name: string;
  color?: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  contentHTML: string;
  category?: string;
  tags?: string[];
}

interface NoteFormProps {
  initialData?: NoteFormData | null;
  categories?: Category[];
  onSubmit: (data: NoteFormData) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const NoteForm = ({ initialData, categories = [], onSubmit, onClose, isLoading = false }: NoteFormProps) => {
  const [form, setForm] = useState<NoteFormData>({
    title: '',
    content: '',
    contentHTML: '',
    category: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        content: initialData.content || '',
        contentHTML: initialData.contentHTML || '',
        category: initialData.category || '',
        tags: initialData.tags || [],
      });
    }
  }, [initialData]);

  const handleEditorChange = (text: string, html: string): void => {
    setForm((prev: NoteFormData) => ({ ...prev, content: text, contentHTML: html }));
  };

  const handleAddTag = (): void => {
    const tag: string = tagInput.trim();
    if (tag && !form.tags?.includes(tag)) {
      setForm((prev: NoteFormData) => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string): void => {
    setForm((prev: NoteFormData) => ({
      ...prev,
      tags: (prev.tags || []).filter((t: string) => t !== tag),
    }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label htmlFor="note-title" className="sr-only">Título</label>
      <input
        id="note-title"
        type="text"
        value={form.title}
        onChange={(e) => setForm((p: NoteFormData) => ({ ...p, title: e.target.value }))}
        placeholder="Título de la nota"
        className="w-full text-lg font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600"
        autoFocus
      />

      <RichTextEditor
        content={form.contentHTML}
        onChange={handleEditorChange}
        placeholder="Escribe tu contenido aquí..."
      />

      {categories.length > 0 && (
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-gray-400 dark:text-slate-500" />
          <label htmlFor="note-category" className="sr-only">Categoría</label>
          <select
            id="note-category"
            value={form.category}
            onChange={(e) => setForm((p: NoteFormData) => ({ ...p, category: e.target.value }))}
            className="text-sm bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl px-3 py-2 text-gray-700 dark:text-slate-300"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat: Category) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-gray-400 dark:text-slate-500" />
        <div className="flex flex-wrap gap-1.5 flex-1">
          {form.tags?.map((tag: string) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 rounded-lg text-xs font-semibold">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <label htmlFor="note-tags" className="sr-only">Etiquetas</label>
          <input
            id="note-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            placeholder="Agregar etiqueta..."
            className="text-sm bg-transparent border-none outline-none text-gray-500 dark:text-slate-400 placeholder-gray-400 dark:placeholder-slate-600 min-w-[100px] flex-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" isLoading={isLoading} icon={Save}>
          {initialData ? 'Guardar cambios' : 'Crear nota'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default NoteForm;
