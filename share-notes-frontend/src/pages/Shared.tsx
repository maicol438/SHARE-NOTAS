import { useEffect } from 'react';
import { Share2 } from 'lucide-react';
import api from '../api/axios';
import { showToast } from '../utils/toast';
import { useState } from 'react';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

interface SharedNote {
  _id: string;
  title: string;
  description?: string;
  user?: { name: string };
  updatedAt: string;
}

const Shared: React.FC = () => {
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<SharedNote | null>(null);
  const [shareEmail, setShareEmail] = useState<string>('');
  const [sharePermission, setSharePermission] = useState<string>('read');

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const fetchSharedNotes = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.get('/notes/shared');
      setNotes(res.data.notes);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      showToast('Ingresa un email', 'error');
      return;
    }
    try {
      await api.post(`/notes/${selectedNote?._id}/share`, { email: shareEmail, permission: sharePermission });
      showToast(`Nota compartida con ${shareEmail}`, 'success');
      setShowShareModal(false);
      setShareEmail('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al compartir', 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">Compartido conmigo</h1>
        <p className="text-slate-500 dark:text-slate-500">{notes.length} notas compartidas</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i: number) => (
            <div key={i} className="bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl p-6">
              <div className="h-5 bg-slate-200 dark:bg-white/[0.05] animate-pulse rounded w-3/4 mb-3" />
              <div className="h-4 bg-slate-200/50 dark:bg-white/[0.03] animate-pulse rounded w-1/2" />
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
          {notes.map((note: SharedNote) => (
            <div key={note._id} className="bg-white dark:bg-[#0d0b1f] border border-slate-200 dark:border-white/[0.06] rounded-xl p-5 hover:border-slate-300 dark:hover:border-white/[0.1] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{note.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Por {note.user?.name}</p>
                </div>
                <button
                  onClick={() => { setSelectedNote(note); setShowShareModal(true); }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl"
                >
                  <Share2 className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                </button>
              </div>
              {note.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{note.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-500">
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
            <label className="block text-sm font-medium text-slate-800 dark:text-white mb-1">Email del usuario</label>
            <input
              type="email"
              value={shareEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShareEmail(e.target.value)}
              className="input-field"
              placeholder="email@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-white mb-1">Permiso</label>
            <select
              value={sharePermission}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSharePermission(e.target.value)}
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
};

export default Shared;
