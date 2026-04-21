import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Envía la cookie HTTP-only en cada petición
  headers: { "Content-Type": "application/json" },
});

// Interceptor de respuesta: redirigir al login si el token expiró
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar estado y redirigir solo si no estamos ya en auth pages
      const isAuthPage = ["/login", "/register", "/"].includes(window.location.pathname);
      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
