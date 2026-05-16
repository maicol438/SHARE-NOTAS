import axios from "axios";

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
export const onUnauthorized = (cb) => {
  logoutCallback = cb;
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
      return Promise.reject(error);
    }
    if (!error.response) {
      return Promise.reject(new Error("No se pudo conectar al servidor"));
    }
    return Promise.reject(error);
  }
);

export default api;
