import { useEffect } from "react";
import { Users, Mail, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useState } from "react";
import useNoteStore from "../stores/useNoteStore";
import NoteCard from "../components/notes/NoteCard";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

export default function Shared() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("read");

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const fetchSharedNotes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/notes/shared");
      setNotes(res.data.notes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      toast.error("Ingresa un email");
      return;
    }
    try {
      await api.post(`/notes/${selectedNote._id}/share`, { email: shareEmail, permission: sharePermission });
      toast.success(`Nota compartida con ${shareEmail}`);
      setShowShareModal(false);
      setShareEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al compartir");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-1">👥 Compartido conmigo</h1>
        <p className="text-gray-500">{notes.length} notas compartidas</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border rounded-2xl p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          type="explore"
          title="No hay notas compartidas"
          subtitle="Las notas que otros compartan contigo aparecerán aquí"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="text-xs text-gray-500">Por {note.user?.name}</p>
                </div>
                <button
                  onClick={() => { setSelectedNote(note); setShowShareModal(true); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  <Share2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {note.description && (
                <p className="text-sm text-gray-500 line-clamp-2">{note.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Compartir nota">
        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email del usuario</label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="input-field"
              placeholder="email@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Permiso</label>
            <select
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value)}
              className="input-field"
            >
              <option value="read">Solo lectura</option>
              <option value="edit">Puede editar</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            Compartir
          </Button>
        </form>
      </Modal>
    </div>
  );
}