import useNoteStore from "../stores/useNoteStore";
import { useEffect } from "react";
import { CheckSquare, Plus, Clock, AlertCircle, Share2, Mail, ExternalLink, Loader2 } from "lucide-react";
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

  const [creatingGoogleDoc, setCreatingGoogleDoc] = useState(null);

  const handleGoogleDocTask = async (task, force = false) => {
    if (force && task.googleDocId) {
      const ok = window.confirm("¿Regenerar el documento de Google? Se creará uno nuevo.");
      if (!ok) return;
    }
    setCreatingGoogleDoc(task._id);
    try {
      const url = force ? `/tasks/${task._id}/google-doc?force=true` : `/tasks/${task._id}/google-doc`;
      const res = await api.post(url);
      if (res.data.googleDocUrl) {
        window.open(res.data.googleDocUrl, "_blank");
        showToast("Documento de Google creado", "success");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Error al crear documento";
      if (msg.includes("GOOGLE_SERVICE_ACCOUNT_JSON")) {
        showToast("Google Docs no está configurado en el servidor", "error");
      } else {
        showToast(msg, "error");
      }
    } finally {
      setCreatingGoogleDoc(null);
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
          <h1 className="text-2xl font-bold gradient-text mb-1">📝 Tareas</h1>
          <p className="text-gray-500">{tasks.length} tareas</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
          Nueva tarea
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState type="notes" title="No hay tareas" subtitle="Crea tu primera tarea" onAction={() => setShowModal(true)} />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Pendientes ({pending.length})
              </h2>
              <div className="space-y-3">
                  {pending.map((task) => (
                  <div key={task._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleComplete(task._id)} className="mt-1 w-6 h-6 rounded-full border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-500 transition-all flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{task.title}</h3>
                            {task.description && <p className="text-gray-500 text-sm mt-1">{task.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleGoogleDocTask(task, !!task.googleDocId)}
                              disabled={creatingGoogleDoc === task._id}
                              className="p-2 rounded-xl text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
                              title={creatingGoogleDoc === task._id ? "Exportando..." : (task.googleDocId ? "Regenerar Google Doc" : "Crear Google Doc")}
                            >
                              {creatingGoogleDoc === task._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setSharingTask(task); setShareEmail(""); setShowShareModal(true); }}
                              className="p-2 rounded-xl text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-all opacity-0 group-hover:opacity-100"
                              title="Compartir tarea"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.priority === "urgent" ? "bg-red-100 text-red-600" :
                            task.priority === "high" ? "bg-orange-100 text-orange-600" :
                            "bg-yellow-100 text-yellow-600"
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
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                Completadas ({completed.length})
              </h2>
              <div className="space-y-3">
                {completed.map((task) => (
                  <div key={task._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 opacity-60">
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
