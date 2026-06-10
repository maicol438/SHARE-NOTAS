import useNoteStore from '../stores/useNoteStore';
import { useEffect } from 'react';
import { CheckSquare, Plus, Clock, Share2, Download, Loader2 } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useState } from 'react';
import { showToast } from '../utils/toast';
import api from '../api/axios';

interface TaskForm {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  category: string;
}

interface Category {
  _id: string;
  name: string;
  color?: string;
}

const Tasks: React.FC = () => {
  const { fetchNotes, notes, categories, fetchCategories, isLoading, updateNote, createNote } = useNoteStore();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<{ _id: string; title: string; description?: string; dueDate?: string; priority?: string; category?: string } | null>(null);
  const [form, setForm] = useState<TaskForm>({ title: '', description: '', dueDate: '', priority: 'medium', category: '' });
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharingTask, setSharingTask] = useState<{ _id: string; title: string } | null>(null);
  const [shareEmail, setShareEmail] = useState<string>('');

  useEffect(() => { 
    fetchNotes({ type: 'task' as string }); 
    fetchCategories();
  }, [fetchNotes, fetchCategories]);

  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories, form.category]);

  const tasks = (notes || []).filter((n: { type?: string }) => n.type === 'task');
  const pending = tasks.filter((t: { isCompleted?: boolean }) => !t.isCompleted);
  const completed = tasks.filter((t: { isCompleted?: boolean }) => t.isCompleted);

  const handleComplete = async (id: string): Promise<void> => {
    const task = tasks.find(t => t._id === id);
    if (task) {
      await updateNote(id, { isCompleted: !task.isCompleted });
    }
  };

  const [exportingDocx, setExportingDocx] = useState<string | null>(null);

  const handleExportDocx = async (task: { _id: string; title: string }): Promise<void> => {
    setExportingDocx(task._id);
    try {
      const res = await api.post(`/tasks/${task._id}/export-docx`, {}, { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${task.title.replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, '').trim() || 'tarea'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Documento Word descargado', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || 'Error al exportar a Word';
      showToast(msg, 'error');
    } finally {
      setExportingDocx(null);
    }
  };

  const handleShareTask = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      showToast('Ingresa un email', 'error');
      return;
    }
    try {
      await api.post(`/notes/${sharingTask?._id}/share`, { email: shareEmail, permission: 'read' });
      showToast(`Tarea compartida con ${shareEmail}`, 'success');
      setShowShareModal(false);
      setShareEmail('');
      setSharingTask(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al compartir', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('El título es requerido', 'error');
      return;
    }
    if (!form.category) {
      showToast('Selecciona una categoría', 'error');
      return;
    }
    const data = { ...form, type: 'task' };
    if (editingTask) {
      await updateNote(editingTask._id, data);
    } else {
      await createNote(data);
    }
    setShowModal(false);
    setForm({ title: '', description: '', dueDate: '', priority: 'medium', category: categories[0]?._id || '' });
    setEditingTask(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1">Tareas</h1>
          <p className="text-gray-500 dark:text-slate-400">{tasks.length} tareas</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)} className="btn-primary">
          Nueva tarea
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i: number) => (
            <div key={i} className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-white/[0.08] rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-white/[0.05] rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState type="notes" title="No hay tareas" subtitle="Crea tu primera tarea" onAction={() => setShowModal(true)} />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-3">
                Pendientes ({pending.length})
              </h2>
              <div className="space-y-3">
                  {pending.map((task: { _id: string; title: string; description?: string; dueDate?: string; priority?: string }) => (
                  <div key={task._id} className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/[0.1] transition-all group">
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleComplete(task._id)} className="mt-1 w-6 h-6 rounded-full border-2 border-gray-300 dark:border-white/[0.2] hover:border-primary-500 hover:bg-primary-500 transition-all flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">{task.title}</h3>
                            {task.description && <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{task.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleExportDocx(task)}
                              disabled={exportingDocx === task._id}
                              className="p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              title={exportingDocx === task._id ? 'Exportando...' : 'Descargar Word'}
                            >
                              {exportingDocx === task._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setSharingTask(task); setShareEmail(''); setShowShareModal(true); }}
                              className="p-2 rounded-xl text-gray-400 dark:text-slate-400 hover:bg-primary-500/10 hover:text-primary-400 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                              title="Compartir tarea"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            task.priority === 'urgent' ? 'bg-red-500/10 text-red-500 dark:text-red-400' :
                            task.priority === 'high' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400' :
                            'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-3">
                Completadas ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((task: { _id: string; title: string }) => (
                  <div key={task._id} className="bg-white dark:bg-[#0d0b1f] border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 opacity-50">
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleComplete(task._id)} className="mt-1 w-6 h-6 rounded-full bg-green-500 flex flex-shrink-0 flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-white" />
                      </button>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white line-through">{task.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTask(null); }} title={editingTask ? 'Editar tarea' : 'Nueva tarea'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Título *</label>
            <input value={form.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, title: e.target.value})} className="input-field" placeholder="Título de la tarea" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="Descripción..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Fecha de vencimiento</label>
              <input type="date" value={form.dueDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({...form, dueDate: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Prioridad</label>
              <select value={form.priority} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, priority: e.target.value})} className="input-field">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Categoría *</label>
            <select value={form.category} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form, category: e.target.value})} className="input-field" required>
              <option value="">Selecciona una categoría</option>
              {(categories || []).map((cat: Category) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            {editingTask ? 'Guardar cambios' : 'Crear tarea'}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showShareModal} onClose={() => { setShowShareModal(false); setSharingTask(null); }} title="Compartir tarea">
        <form onSubmit={handleShareTask} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-1">Email del usuario</label>
            <input type="email" value={shareEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShareEmail(e.target.value)} className="input-field" placeholder="email@ejemplo.com" required />
          </div>
          <Button type="submit" className="w-full">Compartir</Button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
