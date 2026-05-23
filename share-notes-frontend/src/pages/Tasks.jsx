import useNoteStore from "../stores/useNoteStore";
import { useEffect } from "react";
import { CheckSquare, Plus, Clock, AlertCircle, Share2, Mail, Download, Loader2 } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useState } from "react";
import { showToast } from "../utils/toast.jsx";
import api from "../api/axios";

export default function Tasks() {
  const { fetchNotes, notes, categories, fetchCategories, isLoading, toggleTaskComplete, createNote, updateNote, moveToTrash } = useNoteStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "medium", category: "" });
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingTask, setSharingTask] = useState(null);
  const [shareEmail, setShareEmail] = useState("");

  useEffect(() => { 
    fetchNotes({ type: "task" }); 
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: categories[0]._id }));
    }
  }, [categories]);

  const tasks = (notes || []).filter(n => n.type === "task");
  const pending = tasks.filter(t => !t.isCompleted);
  const completed = tasks.filter(t => t.isCompleted);

  const handleComplete = async (id) => {
    await toggleTaskComplete(id);
  };

  const [exportingDocx, setExportingDocx] = useState(null);

  const handleExportDocx = async (task) => {
    setExportingDocx(task._id);
    try {
      const res = await api.post(`/tasks/${task._id}/export-docx`, {}, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${task.title.replace(/[^a-zA-Z0-9áéíóúñ\s-]/g, "").trim() || "tarea"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Documento Word descargado", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Error al exportar a Word";
      showToast(msg, "error");
    } finally {
      setExportingDocx(null);
    }
  };

  const handleShareTask = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      showToast("Ingresa un email", "error");
      return;
    }
    try {
      await api.post(`/notes/${sharingTask._id}/share`, { email: shareEmail, permission: "read" });
      showToast(`Tarea compartida con ${shareEmail}`, "success");
      setShowShareModal(false);
      setShareEmail("");
      setSharingTask(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al compartir", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("El título es requerido", "error");
      return;
    }
    if (!form.category) {
      showToast("Selecciona una categoría", "error");
      return;
    }
    const data = { ...form, type: "task" };
    if (editingTask) {
      await updateNote(editingTask._id, data);
    } else {
      await createNote(data);
    }
    setShowModal(false);
    setForm({ title: "", description: "", dueDate: "", priority: "medium", category: categories[0]?._id || "" });
    setEditingTask(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1">Tareas</h1>
          <p className="text-slate-500 dark:text-surface-500">{tasks.length} tareas</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)} className="btn-primary">
          Nueva tarea
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800/60 rounded-xl p-6 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-surface-800 rounded w-1/3 mb-3" />
              <div className="h-4 bg-slate-200 dark:bg-surface-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState type="notes" title="No hay tareas" subtitle="Crea tu primera tarea" onAction={() => setShowModal(true)} />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 dark:text-surface-500 uppercase mb-3">
                Pendientes ({pending.length})
              </h2>
              <div className="space-y-3">
                  {pending.map((task) => (
                  <div key={task._id} className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800/60 rounded-xl p-5 hover:border-slate-300 dark:hover:border-surface-700/60 transition-all group">
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleComplete(task._id)} className="mt-1 w-6 h-6 rounded-full border-2 border-slate-300 dark:border-surface-600 hover:border-primary-500 hover:bg-primary-500 transition-all flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{task.title}</h3>
                            {task.description && <p className="text-slate-500 dark:text-surface-500 text-sm mt-1">{task.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleExportDocx(task)}
                              disabled={exportingDocx === task._id}
                              className="p-2 rounded-xl text-slate-400 dark:text-surface-400 hover:bg-blue-500/10 hover:text-blue-400 transition-all sm:opacity-0 sm:group-hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              title={exportingDocx === task._id ? "Exportando..." : "Descargar Word"}
                            >
                              {exportingDocx === task._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setSharingTask(task); setShareEmail(""); setShowShareModal(true); }}
                              className="p-2 rounded-xl text-slate-400 dark:text-surface-400 hover:bg-primary-500/10 hover:text-primary-400 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                              title="Compartir tarea"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-surface-400">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.priority === "urgent" ? "bg-red-500/10 text-red-400" :
                            task.priority === "high" ? "bg-orange-500/10 text-orange-400" :
                            "bg-yellow-500/10 text-yellow-400"
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
              <h2 className="text-xs font-semibold text-slate-500 dark:text-surface-500 uppercase mb-3">
                Completadas ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((task) => (
                  <div key={task._id} className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800/60 rounded-xl p-5 opacity-50">
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleComplete(task._id)} className="mt-1 w-6 h-6 rounded-full bg-green-500 flex flex-shrink-0 flex items-center justify-center">
                        <CheckSquare className="w-4 h-4 text-white" />
                      </button>
                      <div>
                        <h3 className="font-semibold line-through">{task.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTask(null); }} title={editingTask ? "Editar tarea" : "Nueva tarea"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Título de la tarea" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="Descripción..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha de vencimiento</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prioridad</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoría *</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field" required>
              <option value="">Selecciona una categoría</option>
              {(categories || []).map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">
            {editingTask ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showShareModal} onClose={() => { setShowShareModal(false); setSharingTask(null); }} title="Compartir tarea">
        <form onSubmit={handleShareTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email del usuario</label>
            <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="input-field" placeholder="email@ejemplo.com" required />
          </div>
          <Button type="submit" className="w-full">Compartir</Button>
        </form>
      </Modal>
    </div>
  );
}
