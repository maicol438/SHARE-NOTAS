import { create } from "zustand";
import api from "../api/axios";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true, // true al inicio para evitar flicker

  // ── Registro ────────────────────────────────────────────────────
  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return { ok: true };
    } catch (err) {
      set({ isLoading: false });
      return { ok: false, message: err.response?.data?.message || "Error al registrarse" };
    }
  },

  // ── Login ───────────────────────────────────────────────────────
  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return { ok: true, user: res.data.user };
    } catch (err) {
      set({ isLoading: false });
      return { ok: false, message: err.response?.data?.message || "Credenciales inválidas" };
    }
  },

  // ── Logout ──────────────────────────────────────────────────────
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  // ── checkAuth: se llama al montar la app para restaurar sesión ──
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));

export default useAuthStore;
