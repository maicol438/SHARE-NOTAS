import { useState, useEffect } from "react";
import { FolderOpen, Upload, Image, FileText, X, Share2 } from "lucide-react";
import useNoteStore from "../stores/useNoteStore";
import { showToast } from "../utils/toast.jsx";
import api from "../api/axios";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";

export default function Files() {
  const { files, fetchFiles, deleteFile, isLoading } = useNoteStore();
  const [uploading, setUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingFile, setSharingFile] = useState(null);
  const [shareEmail, setShareEmail] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleShareFile = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) {
      showToast("Ingresa un email", "error");
      return;
    }
    try {
      await api.post(`/files/${sharingFile._id}/share`, { email: shareEmail });
      showToast(`Archivo compartido con ${shareEmail}`, "success");
      setShowShareModal(false);
      setShareEmail("");
      setSharingFile(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Error al compartir", "error");
    }
  };

  const handleUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 3) {
      showToast("Máximo 3 archivos a la vez", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await api.post("/files/upload", formData);
      
      if (res.data.files && res.data.files.length > 0) {
        await fetchFiles();
        showToast(`${res.data.files.length} archivo(s) subido(s)`, "success");
      }
    } catch (err) {
      showToast("Error al subir archivos: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (filename) => {
    try {
      await deleteFile(filename);
      showToast("Archivo eliminado", "success");
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  const getIcon = (type) => {
    if (type?.startsWith("image/")) return Image;
    return FileText;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-surface-100 mb-1">Archivos</h1>
          <p className="text-slate-500 dark:text-surface-500">{files?.length || 0} archivos</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer btn-primary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? "Subiendo..." : "Subir archivos"}
            <input
              type="file"
              multiple
              onChange={handleUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {(!files || files.length === 0) ? (
        <EmptyState
          type="notes"
          title="No hay archivos"
          subtitle="Sube tus primeros archivos"
          actionLabel="Subir archivos"
          onAction={() => document.querySelector('input[type="file"]').click()}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file) => {
            const Icon = getIcon(file.type);
            return (
              <div key={file._id || file.filename} className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-surface-800/60 rounded-xl p-4 hover:border-slate-300 dark:hover:border-surface-700/60 transition-all relative group animate-fade-in">
                <button
                  onClick={() => { setSharingFile(file); setShareEmail(""); setShowShareModal(true); }}
                  className="absolute top-2 right-10 p-1.5 bg-primary-500 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-90"
                  title="Compartir archivo"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(file.filename)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:scale-110 active:scale-90"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {file.type?.startsWith("image/") ? (
                  <img src={file.url} alt={file.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-32 bg-slate-100 dark:bg-surface-800 rounded-xl mb-3 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-slate-400 dark:text-surface-400" />
                  </div>
                )}
                <p className="font-medium text-sm text-slate-800 dark:text-surface-100 truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-surface-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            );
          })}
        </div>
      )}
      <Modal isOpen={showShareModal} onClose={() => { setShowShareModal(false); setSharingFile(null); }} title="Compartir archivo">
        <form onSubmit={handleShareFile} className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-surface-500 mb-2">
            {sharingFile && `Compartir "${sharingFile.name}" con otro usuario`}
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-surface-100 mb-1">Email del usuario</label>
            <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="input-field" placeholder="email@ejemplo.com" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowShareModal(false)} className="flex-1 btn-secondary">Cancelar</button>
            <Button type="submit" className="flex-1">Compartir</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
