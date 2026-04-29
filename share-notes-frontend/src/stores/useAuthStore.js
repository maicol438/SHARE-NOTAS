import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,

  setUser: (userData) => {
    set({ user: userData, isAuthenticated: !!userData });
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", data);
      const { token, user } = res.data;
      if (token) localStorage.setItem("token", token);
      set({ user, isAuthenticated: true, isLoading: false });
      return { ok: true, user };
    } catch (err) {
      set({ isLoading: false });
      return { ok: false, message: err.response?.data?.message || "Error al registrar" };
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", data);
      const { token, user } = res.data;
      if (token) localStorage.setItem("token", token);
      set({ user, isAuthenticated: true, isLoading: false });
      return { ok: true, user };
    } catch (err) {
      set({ isLoading: false });
      return { ok: false, message: err.response?.data?.message || "Credenciales incorrectas" };
    }
  },

  logout: async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false, isCheckingAuth: false });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    const token = localStorage.getItem("token");
    if (!token) {
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
      return;
    }
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, isAuthenticated: true, isCheckingAuth: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false, isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;
