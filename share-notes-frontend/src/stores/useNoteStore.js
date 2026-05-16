import { create } from "zustand";
import api from "../api/axios";
import { showToast } from "../utils/toast.jsx";

const useNoteStore = create((set, get) => ({
  notes: [],
  publicNotes: [],
  trashNotes: [],
  files: [],
  categories: [],
  notebooks: [],
  tags: [],
  isLoading: false,
  activeCategory: null,
  searchQuery: "",
  favoriteFilter: false,
  localSearch: "",

  localSearchNotes: (query) => {
    set({ localSearch: query });
  },

  getFilteredNotes: () => {
    const state = get();
    const notes = state?.notes || [];
    const { localSearch, activeCategory, favoriteFilter } = state;
    let filtered = [...notes];

    if (localSearch) {
      const q = localSearch.toLowerCase();
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      filtered = filtered.filter(n => n.category?._id === activeCategory || n.category === activeCategory);
    }
    if (favoriteFilter) {
      filtered = filtered.filter(n => n.isFavorite);
    }

    return filtered.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  },

  fetchNotes: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.pinned !== undefined) params.set("pinned", filters.pinned);

      const res = await api.get(`/notes?${params}`);
      set({ notes: res.data.notes });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Error al cargar notas" };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPublicNotes: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      if (filters.tags) params.set("tags", filters.tags);

      const res = await api.get(`/notes/public?${params}`);
      set({ publicNotes: res.data.notes });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Error al buscar" };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTrash: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/notes/trash");
      set({ trashNotes: res.data.notes });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Error al cargar la papelera" };
    } finally {
      set({ isLoading: false });
    }
  },

  createNote: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/notes", data);
      set((s) => ({ notes: [res.data.note, ...s.notes] }));
      showToast("¡Nota creada!", "success", { duration: 3000 });
      return { ok: true };
    } catch (err) {
      showToast("No se pudo crear la nota", "error");
      return { ok: false, message: err.response?.data?.message || "Error al crear la nota" };
    } finally {
      set({ isLoading: false });
    }
  },

  updateNote: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await api.put(`/notes/${id}`, data);
      set((s) => ({
        notes: s.notes.map((n) => (n._id === id ? res.data.note : n)),
      }));
      showToast("Cambios guardados", "success", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      showToast("No se pudieron guardar los cambios", "error");
      return { ok: false, message: err.response?.data?.message || "Error al actualizar" };
    } finally {
      set({ isLoading: false });
    }
  },

  moveToTrash: async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      set((s) => ({
        notes: s.notes.filter((n) => n._id !== id),
      }));
      showToast("Nota enviada a la papelera", "success", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      showToast("No se pudo eliminar la nota", "error");
      return { ok: false, message: err.response?.data?.message || "Error al mover a papelera" };
    }
  },

  restoreNote: async (id) => {
    try {
      const res = await api.patch(`/notes/${id}/restore`);
      set((s) => ({
        notes: [...s.notes, res.data.note],
        trashNotes: s.trashNotes.filter((n) => n._id !== id),
      }));
      showToast("¡Nota restaurada!", "success", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      showToast("No se pudo restaurar la nota", "error");
      return { ok: false, message: err.response?.data?.message || "Error al restaurar" };
    }
  },

  permanentDelete: async (id) => {
    try {
      await api.delete(`/notes/${id}/permanent`);
      set((s) => ({
        trashNotes: s.trashNotes.filter((n) => n._id !== id),
      }));
      showToast("Nota eliminada permanentemente", "error", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      showToast("No se pudo eliminar la nota", "error");
      return { ok: false, message: err.response?.data?.message || "Error al eliminar" };
    }
  },

  togglePin: async (id) => {
    const note = get().notes.find(n => n._id === id);
    const isPinned = !note?.isPinned;
    try {
      const res = await api.patch(`/notes/${id}/pin`);
      set((s) => ({
        notes: s.notes.map((n) => (n._id === id ? res.data.note : n)),
      }));
      showToast(isPinned ? "Nota fijada" : "Nota desfijada", "success", { duration: 2000 });
      return { ok: true };
    } catch (err) {
      showToast(err.response?.data?.message || "No se pudo fijar la nota", "error");
      return { ok: false };
    }
  },

  toggleFavorite: async (id) => {
    const note = get().notes.find(n => n._id === id);
    const isFav = !note?.isFavorite;
    try {
      const res = await api.patch(`/notes/${id}/favorite`);
      set((s) => ({
        notes: s.notes.map((n) => (n._id === id ? res.data.note : n)),
      }));
      showToast(isFav ? "Añadida a favoritos" : "Quitada de favoritos", "success", { duration: 2000 });
      return { ok: true };
    } catch (err) {
      showToast(err.response?.data?.message || "No se pudo actualizar favorito", "error");
      return { ok: false };
    }
  },

  toggleTaskComplete: async (id) => {
    try {
      const res = await api.patch(`/notes/tasks/${id}/complete`);
      set((s) => ({
        notes: s.notes.map((n) => (n._id === id ? res.data.note : n)),
      }));
      const completed = res.data.note?.isCompleted;
      showToast(completed ? "Tarea completada" : "Tarea pendiente", "success", { duration: 2000 });
      return { ok: true };
    } catch (err) {
      showToast(err.response?.data?.message || "No se pudo actualizar la tarea", "error");
      return { ok: false };
    }
  },

  downloadNote: async (id) => {
    try {
      const res = await api.post(`/notes/${id}/download`);
      showToast("¡Descarga iniciada!", "success", { duration: 3000 });
      return { ok: true, downloadUrl: res.data.downloadUrl };
    } catch (err) {
      showToast("No se pudo descargar la nota", "error");
      return { ok: false, message: err.response?.data?.message || "Error al descargar" };
    }
  },

  rateNote: async (id, rating) => {
    try {
      const res = await api.post(`/notes/${id}/rate`, { rating });
      showToast(`Calificación guardada`, "success", { duration: 2500 });
      return { ok: true, rating: res.data.rating };
    } catch (err) {
      showToast("No se pudo calificar", "error");
      return { ok: false, message: err.response?.data?.message || "Error al calificar" };
    }
  },

  fetchCategories: async () => {
    try {
      const res = await api.get("/categories");
      set({ categories: res.data.categories });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  createCategory: async (data) => {
    try {
      const res = await api.post("/categories", data);
      set((s) => ({ categories: [...s.categories, res.data.category] }));
      showToast(`Categoría "${data.name}" creada`, "success", { duration: 3000 });
      return { ok: true, category: res.data.category };
    } catch (err) {
      showToast("No se pudo crear la categoría", "error");
      return { ok: false, message: err.response?.data?.message || "Error al crear categoría" };
    }
  },

  deleteCategory: async (id) => {
    const cat = get().categories.find(c => c._id === id);
    try {
      await api.delete(`/categories/${id}`);
      set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
      if (get().activeCategory === id) set({ activeCategory: null });
      showToast(`Categoría "${cat?.name}" eliminada`, "success", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      showToast("No se pudo eliminar la categoría", "error");
      return { ok: false, message: err.response?.data?.message || "Error al eliminar categoría" };
    }
  },

  fetchNotebooks: async () => {
    try {
      const res = await api.get("/notebooks");
      set({ notebooks: res.data.notebooks });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  createNotebook: async (data) => {
    try {
      const res = await api.post("/notebooks", data);
      set((s) => ({ notebooks: [...s.notebooks, res.data.notebook] }));
      showToast(`Cuaderno "${data.name}" creado`, "success", { duration: 3000 });
      return { ok: true, notebook: res.data.notebook };
    } catch (err) {
      showToast("No se pudo crear el cuaderno", "error");
      return { ok: false };
    }
  },

  deleteNotebook: async (id) => {
    try {
      await api.delete(`/notebooks/${id}`);
      set((s) => ({ notebooks: s.notebooks.filter((n) => n._id !== id) }));
      showToast("Cuaderno eliminado", "success", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      showToast("No se pudo eliminar el cuaderno", "error");
      return { ok: false };
    }
  },

  fetchTags: async () => {
    try {
      const res = await api.get("/tags");
      set({ tags: res.data.tags });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  fetchFiles: async () => {
    try {
      const res = await api.get("/files");
      set({ files: res.data.files });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  deleteFile: async (filename) => {
    try {
      await api.delete(`/files/uploads/${filename}`);
      set((s) => ({ files: s.files.filter((f) => f.filename !== filename) }));
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  setActiveCategory: (id) => set({ activeCategory: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFavoriteFilter: (value) => set({ favoriteFilter: value }),
}));

export default useNoteStore;
