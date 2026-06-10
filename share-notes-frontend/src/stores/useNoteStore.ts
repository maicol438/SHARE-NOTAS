import { create } from 'zustand';
import api from '../api/axios';
import { showToast } from '../utils/toast';

interface Category {
  _id: string;
  name: string;
  color?: string;
  user?: string;
}

interface Notebook {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  user?: string;
  isDefault?: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Note {
  _id: string;
  title: string;
  content?: string;
  contentHTML?: string;
  description?: string;
  category?: Category;
  notebook?: Notebook;
  user?: User;
  tags?: string[];
  images?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  isPublic?: boolean;
  isCompleted?: boolean;
  type?: string;
  priority?: string;
  dueDate?: string;
  reminder?: string;
  rating?: number;
  ratingCount?: number;
  downloads?: number;
  views?: number;
  sharedWith?: Array<{ user: string; permission: string }>;
  googleDocId?: string;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface FileItem {
  _id: string;
  user: string;
  originalName: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

interface FetchFilters {
  search?: string;
  category?: string;
  notebook?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

interface NoteCreateData {
  title: string;
  content?: string;
  contentHTML?: string;
  description?: string;
  category?: string;
  notebook?: string;
  tags?: string[];
  isPublic?: boolean;
  isCompleted?: boolean;
  type?: string;
  priority?: string;
  dueDate?: string;
  reminder?: string;
}

interface NoteState {
  notes: Note[];
  publicNotes: Note[];
  trashNotes: Note[];
  files: FileItem[];
  categories: Category[];
  notebooks: Notebook[];
  tags: string[];
  isLoading: boolean;
  activeCategory: string | null;
  searchQuery: string;
  favoriteFilter: boolean;
  localSearch: string;

  localSearchNotes: (query: string) => void;
  getFilteredNotes: () => Note[];
  fetchNotes: (filters?: FetchFilters) => Promise<void>;
  createNote: (data: NoteCreateData) => Promise<Note | null>;
  updateNote: (id: string, data: Partial<NoteCreateData>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  fetchTrash: () => Promise<void>;
  restoreNote: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  fetchPublicNotes: (params?: { q?: string; category?: string; sort?: string }) => Promise<void>;
  fetchFiles: () => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  setFavoriteFilter: (value: boolean) => void;
  fetchCategories: () => Promise<void>;
  fetchNotebooks: () => Promise<void>;
  fetchTags: () => Promise<void>;
}

const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  publicNotes: [],
  trashNotes: [],
  files: [],
  categories: [],
  notebooks: [],
  tags: [],
  isLoading: false,
  activeCategory: null,
  searchQuery: '',
  favoriteFilter: false,
  localSearch: '',

  localSearchNotes: (query: string) => {
    set({ localSearch: query });
  },

  getFilteredNotes: () => {
    const state = get();
    const notes: Note[] = state.notes || [];
    const { localSearch, activeCategory, favoriteFilter } = state;
    let filtered: Note[] = [...notes];

    if (localSearch) {
      const q: string = localSearch.toLowerCase();
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      filtered = filtered.filter(n => n.category?._id === activeCategory);
    }
    if (favoriteFilter) {
      filtered = filtered.filter(n => n.isFavorite);
    }

    return filtered.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  },

  fetchNotes: async (filters: FetchFilters = {}) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.isFavorite) params.set('favorite', 'true');
      if (filters.isPinned) params.set('pinned', 'true');
      if (filters.type) params.set('type', filters.type);
      if (filters.tags?.length) params.set('tags', filters.tags.join(','));
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));

      const qs: string = params.toString();
      const res = await api.get<{ notes: Note[] }>(`/notes${qs ? `?${qs}` : ''}`);
      set({ notes: res.data.notes, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al cargar notas', 'error');
    }
  },

  createNote: async (data: NoteCreateData) => {
    try {
      const res = await api.post<{ note: Note }>('/notes', data);
      const { note } = res.data;
      set((state: NoteState) => ({ notes: [note, ...state.notes] }));
      showToast('Nota creada exitosamente', 'success');
      return note;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al crear nota', 'error');
      return null;
    }
  },

  updateNote: async (id: string, data: Partial<NoteCreateData>) => {
    try {
      const res = await api.put<{ note: Note }>(`/notes/${id}`, data);
      const updated: Note = res.data.note;
      set((state: NoteState) => ({
        notes: state.notes.map((n: Note) => n._id === id ? updated : n),
      }));
      showToast('Nota actualizada', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al actualizar', 'error');
    }
  },

  deleteNote: async (id: string) => {
    try {
      await api.delete(`/notes/${id}`);
      set((state: NoteState) => ({
        notes: state.notes.filter((n: Note) => n._id !== id),
      }));
      showToast('Nota movida a la papelera', 'info');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al eliminar', 'error');
    }
  },

  togglePin: async (id: string) => {
    try {
      const res = await api.patch<{ note: Note }>(`/notes/${id}/pin`);
      const updated: Note = res.data.note;
      set((state: NoteState) => ({
        notes: state.notes.map((n: Note) => n._id === id ? updated : n),
      }));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al fijar nota', 'error');
    }
  },

  toggleFavorite: async (id: string) => {
    try {
      const res = await api.patch<{ note: Note }>(`/notes/${id}/favorite`);
      const updated: Note = res.data.note;
      set((state: NoteState) => ({
        notes: state.notes.map((n: Note) => n._id === id ? updated : n),
      }));
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al marcar favorito', 'error');
    }
  },

  fetchTrash: async () => {
    try {
      const res = await api.get<{ notes: Note[] }>('/notes/trash');
      set({ trashNotes: res.data.notes });
    } catch {
      // Silently fail
    }
  },

  restoreNote: async (id: string) => {
    try {
      await api.patch(`/notes/${id}/restore`);
      set((state: NoteState) => ({
        trashNotes: state.trashNotes.filter((n: Note) => n._id !== id),
      }));
      showToast('Nota restaurada', 'success');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al restaurar', 'error');
    }
  },

  permanentDelete: async (id: string) => {
    try {
      await api.delete(`/notes/${id}/permanent`);
      set((state: NoteState) => ({
        trashNotes: state.trashNotes.filter((n: Note) => n._id !== id),
      }));
      showToast('Nota eliminada permanentemente', 'info');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      showToast(axiosErr.response?.data?.message || 'Error al eliminar', 'error');
    }
  },

  setFavoriteFilter: (value: boolean) => {
    set({ favoriteFilter: value });
  },

  deleteFile: async (id: string) => {
    try {
      await api.delete(`/files/${id}`);
      set((state: NoteState) => ({
        files: state.files.filter((f) => f._id !== id && f.filename !== id),
      }));
      showToast('Archivo eliminado', 'success');
    } catch {
      showToast('Error al eliminar archivo', 'error');
    }
  },

  fetchPublicNotes: async (params?: { q?: string; category?: string; sort?: string }) => {
    try {
      const p = new URLSearchParams();
      if (params?.q) p.set('q', params.q);
      if (params?.category) p.set('category', params.category);
      if (params?.sort) p.set('sort', params.sort);
      const qs: string = p.toString();
      const res = await api.get<{ notes: Note[] }>(`/notes/public${qs ? `?${qs}` : ''}`);
      set({ publicNotes: res.data.notes });
    } catch {
      // Silently fail
    }
  },

  fetchFiles: async () => {
    try {
      const res = await api.get<{ files: FileItem[] }>('/files');
      set({ files: res.data.files });
    } catch {
      // Silently fail
    }
  },

  fetchCategories: async () => {
    try {
      const res = await api.get<{ categories: Category[] }>('/categories');
      set({ categories: res.data.categories });
    } catch {
      // Silently fail
    }
  },

  fetchNotebooks: async () => {
    try {
      const res = await api.get<{ notebooks: Notebook[] }>('/notebooks');
      set({ notebooks: res.data.notebooks });
    } catch {
      // Silently fail
    }
  },

  fetchTags: async () => {
    try {
      const res = await api.get<{ tags: string[] }>('/tags');
      set({ tags: res.data.tags || [] });
    } catch {
      // Silently fail
    }
  },
}));

export default useNoteStore;
