import { create } from "zustand";
import { toast } from "react-hot-toast";
import api from "../api/axios";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/register", data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      toast.success(`¡Cuenta creada! Bienvenido, ${res.data.user.name.split(" ")[0]}! 🎉`, {
        duration: 5000,
      });
      return { ok: true, user: res.data.user };
    } catch (err) {
      set({ isLoading: false });
      const msg = err.response?.data?.message || "No se pudo crear la cuenta";
      toast.error(msg);
      return { ok: false, message: msg };
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.post("/auth/login", data);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      toast.success(`¡Bienvenido de nuevo, ${res.data.user.name.split(" ")[0]}! 👋`, {
        duration: 4000,
      });
      return { ok: true, user: res.data.user };
    } catch (err) {
      set({ isLoading: false });
      const msg = err.response?.data?.message || "Credenciales incorrectas";
      toast.error(msg);
      return { ok: false, message: msg };
    }
  },

  logout: async () => {
    const userName = get().user?.name?.split(" ")[0] || "Usuario";
    try {
      await api.post("/auth/logout");
      set({ user: null, isAuthenticated: false });
      toast.success(`¡Hasta luego, ${userName}! 👋`, { duration: 3000 });
    } catch (err) {
      set({ user: null, isAuthenticated: false });
      toast.success(`Sesión cerrada`, { duration: 3000 });
    }
  },

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