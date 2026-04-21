import { create } from "zustand";
import { toast } from "react-hot-toast";
import api from "../api/axios";

const useNoteStore = create((set, get) => ({
  notes: [],
  publicNotes: [],
  trashNotes: [],
  categories: [],
  isLoading: false,
  activeCategory: null,
  searchQuery: "",
  favoriteFilter: false,
  localSearch: "",

  localSearchNotes: (query) => {
    set({ localSearch: query });
  },

  getFilteredNotes: () => {
    const { notes, localSearch, activeCategory, favoriteFilter } = get();
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
      if (filters.sort) params.set("sort", filters.sort);

      const res = await api.get(`/notes/public?${params}`);
      set({ publicNotes: res.data.notes });
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Error al cargar notas" };
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
      toast.success("¡Nota creada! ✨", { duration: 3000 });
      return { ok: true };
    } catch (err) {
      toast.error("No se pudo crear la nota");
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
      toast.success("Cambios guardados 💾", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      toast.error("No se pudieron guardar los cambios");
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
      toast.success("Nota enviada a la papelera 📦", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      toast.error("No se pudo eliminar la nota");
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
      toast.success("¡Nota restaurada! ✅", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      toast.error("No se pudo restaurar la nota");
      return { ok: false, message: err.response?.data?.message || "Error al restaurar" };
    }
  },

  permanentDelete: async (id) => {
    try {
      await api.delete(`/notes/${id}/permanent`);
      set((s) => ({
        trashNotes: s.trashNotes.filter((n) => n._id !== id),
      }));
      toast.success("Nota eliminada permanentemente 🗑️", { duration: 2500 });
      return { ok: true };
    } catch (err) {
      toast.error("No se pudo eliminar la nota");
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
      toast.success(isPinned ? "Nota fijada 📌" : "Nota desfija", { duration: 2000 });
      return { ok: true };
    } catch {
      toast.error("No se pudo fijar la nota");
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
      toast.success(isFav ? "Añadida a favoritos ⭐" : "Quitada de favoritos", { duration: 2000 });
      return { ok: true };
    } catch {
      toast.error("No se pudo actualizar favorito");
      return { ok: false };
    }
  },

  downloadNote: async (id) => {
    try {
      const res = await api.post(`/notes/${id}/download`);
      toast.success("¡Descarga iniciada! 📥", { duration: 3000 });
      return { ok: true, downloadUrl: res.data.downloadUrl };
    } catch (err) {
      toast.error("No se pudo descargar la nota");
      return { ok: false, message: err.response?.data?.message || "Error al descargar" };
    }
  },

  rateNote: async (id, rating) => {
    try {
      const res = await api.post(`/notes/${id}/rate`, { rating });
      toast.success(`Calificación guardada: ${"⭐".repeat(rating)}`, { duration: 2500 });
      return { ok: true, rating: res.data.rating };
    } catch (err) {
      toast.error("No se pudo calificar");
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
      toast.success(`Categoría "${data.name}" creada 🏷️`, { duration: 3000 });
      return { ok: true, category: res.data.category };
    } catch (err) {
      toast.error("No se pudo crear la categoría");
      return { ok: false, message: err.response?.data?.message || "Error al crear categoría" };
    }
  },

  deleteCategory: async (id) => {
    const cat = get().categories.find(c => c._id === id);
    try {
      await api.delete(`/categories/${id}`);
      set((s) => ({ categories: s.categories.filter((c) => c._id !== id) }));
      if (get().activeCategory === id) set({ activeCategory: null });
      toast.success(`Categoría "${cat?.name}" eliminada`, { duration: 2500 });
      return { ok: true };
    } catch (err) {
      toast.error("No se pudo eliminar la categoría");
      return { ok: false, message: err.response?.data?.message || "Error al eliminar categoría" };
    }
  },

  setActiveCategory: (id) => set({ activeCategory: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFavoriteFilter: (value) => set({ favoriteFilter: value }),
}));

export default useNoteStore;