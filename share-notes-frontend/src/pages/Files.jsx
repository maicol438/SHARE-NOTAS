import { useState } from "react";
import { FolderOpen, Upload, Image, FileText, Grid, List, X, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function Files() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState("grid");

  const handleUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length > 3) {
      toast.error("Máximo 3 archivos a la vez");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("files", file); // "files" (plural) debe coincidir con el backend
    });

    try {
      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // El backend devuelve: { message, files: [...] }
      if (res.data.files && res.data.files.length > 0) {
        setFiles(prev => [...prev, ...res.data.files]);
        toast.success(`${res.data.files.length} archivo(s) subido(s)`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al subir archivos: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      // Limpiar el input para permitir subir los mismos archivos otra vez
      e.target.value = '';
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
          <h1 className="text-2xl font-bold gradient-text mb-1">📁 Archivos</h1>
          <p className="text-gray-500">{files.length} archivos</p>
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

      {files.length === 0 ? (
        <EmptyState
          type="notes"
          title="No hay archivos"
          subtitle="Sube tus primeros archivos"
          actionLabel="Subir archivos"
          onAction={() => document.querySelector('input[type="file"]').click()}
        />
      ) : (
        <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-4 gap-4" : "space-y-3"}>
          {files.map((file, i) => {
            const Icon = getIcon(file.type);
            return (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-lg transition-all">
                {file.type?.startsWith("image/") ? (
                  <img src={file.url} alt={file.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-xl mb-3 flex items-center justify-center">
                    <Icon className="w-10 h-10 text-gray-400" />
                  </div>
                )}
                <p className="font-medium text-sm truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
