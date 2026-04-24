import useNoteStore from "../stores/useNoteStore";
import { useEffect } from "react";
import { CheckSquare, Plus, Clock, AlertCircle } from "lucide-react";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Tasks() {
  const { fetchNotes, notes, isLoading, toggleTaskComplete, createNote, updateNote, moveToTrash } = useNoteStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", priority: "medium" });

  useEffect(() => { fetchNotes({}); }, []);

  const tasks = (notes || []).filter(n => n.type === "task");
  const pending = tasks.filter(t => !t.isCompleted);
  const completed = tasks.filter(t => t.isCompleted);

  const handleComplete = async (id) => {
    await toggleTaskComplete(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("El título es requerido");
      return;
    }
    const data = { ...form, type: "task" };
    if (editingTask) {
      await updateNote(editingTask._id, data);
    } else {
      await createNote(data);
    }
    setShowModal(false);
    setForm({ title: "", description: "", dueDate: "", priority: "medium" });
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
                  <div key={task._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <button onClick={() => handleComplete(task._id)} className="mt-1 w-6 h-6 rounded-full border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-500 transition-all flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{task.title}</h3>
                        {task.description && <p className="text-gray-500 text-sm mt-1">{task.description}</p>}
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
          <Button type="submit" className="w-full">
            {editingTask ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}