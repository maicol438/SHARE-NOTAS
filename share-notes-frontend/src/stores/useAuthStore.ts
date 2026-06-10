import { create } from 'zustand';
import api from '../api/axios';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  authProvider?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  setUser: (userData: User | null) => void;
  register: (data: { name: string; email: string; password: string }) => Promise<{ ok: boolean; user?: User; message?: string }>;
  login: (data: { email: string; password: string }) => Promise<{ ok: boolean; user?: User; message?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,

  setUser: (userData: User | null) => {
    set({ user: userData, isAuthenticated: !!userData });
  },

  register: async (data: { name: string; email: string; password: string }) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: User }>('/auth/register', data);
      const { user } = res.data;
      set({ isLoading: false });
      return { ok: true, user };
    } catch (err: unknown) {
      set({ isLoading: false });
      const axiosErr = err as { response?: { data?: { message?: string } } };
      return { ok: false, message: axiosErr.response?.data?.message || 'Error al registrar' };
    }
  },

  login: async (data: { email: string; password: string }) => {
    set({ isLoading: true });
    try {
      const res = await api.post<{ user: User }>('/auth/login', data);
      const { user } = res.data;
      set({ user, isAuthenticated: true, isLoading: false });
      return { ok: true, user };
    } catch (err: unknown) {
      set({ isLoading: false });
      const axiosErr = err as { response?: { data?: { message?: string } } };
      return { ok: false, message: axiosErr.response?.data?.message || 'Credenciales incorrectas' };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignorar error de logout
    }
    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    localStorage.clear();
    sessionStorage.clear();
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;
