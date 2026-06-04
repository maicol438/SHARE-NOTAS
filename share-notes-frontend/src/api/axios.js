import axios from "axios";
import toast from "react-hot-toast";

const RAW_URL = import.meta.env.VITE_API_URL;
const API_BASE = RAW_URL || window.location.origin;
const API_URL = RAW_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export { API_BASE };

let logoutCallback = null;
let forbiddenCallback = null;

export const onUnauthorized = (cb) => {
  logoutCallback = cb;
};

export const onForbidden = (cb) => {
  forbiddenCallback = cb;
};

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (logoutCallback) logoutCallback();
      toast.error("Sesión expirada. Inicia sesión nuevamente.");
      return Promise.reject(error);
    }
    if (error.response?.status === 403) {
      const message = error.response.data?.message || "No tienes permiso para realizar esta acción";
      toast.error(message);
      if (forbiddenCallback) forbiddenCallback(error.response.data);
      return Promise.reject(error);
    }
    if (!error.response) {
      return Promise.reject(new Error("No se pudo conectar al servidor"));
    }
    return Promise.reject(error);
  }
);

export default api;
