import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Error de red:", error.message);
      return Promise.reject(new Error("No se pudo conectar al servidor. Verifica tu conexión."));
    }
    if (error.response?.status === 401) {
      const isAuthPage = ["/login", "/register", "/"].some(p => window.location.pathname.startsWith(p));
      if (!isAuthPage) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;