import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return { ok: true, user: res.data.user };
    } catch (err) {
      set({ isLoading: false });
      const msg = err.response?.data?.message || "No se pudo crear la cuenta";
      return { ok: false, message: msg };
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return { ok: true, user: res.data.user };
    } catch (err) {
      set({ isLoading: false });
      const msg = err.response?.data?.message || "Credenciales incorrectas";
      return { ok: false, message: msg };
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
    } finally {
      // Limpiar cookie manualmente
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
      // Limpiar todo el state
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, isAuthenticated: true });
    } catch (err) {
      // Si el token es inválido o expirado, forzar limpieza
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;