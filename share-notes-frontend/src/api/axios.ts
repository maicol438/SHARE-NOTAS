import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const RAW_URL: string | undefined = import.meta.env.VITE_API_URL;
const API_URL: string = RAW_URL || '/api';

export const API_BASE: string = RAW_URL || window.location.origin;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

type LogoutCallback = () => void;
type ForbiddenCallback = (data: unknown) => void;

let logoutCallback: LogoutCallback | null = null;
let forbiddenCallback: ForbiddenCallback | null = null;

export const onUnauthorized = (cb: LogoutCallback): void => {
  logoutCallback = cb;
};

export const onForbidden = (cb: ForbiddenCallback): void => {
  forbiddenCallback = cb;
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      api.post('/auth/logout').catch(() => {});
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
      if (logoutCallback) logoutCallback();
      return Promise.reject(error);
    }
    if (error.response?.status === 403) {
      const message: string = error.response.data?.message || 'No tienes permiso para realizar esta acción';
      toast.error(message);
      if (forbiddenCallback) forbiddenCallback(error.response.data);
      return Promise.reject(error);
    }
    if (!error.response) {
      return Promise.reject(new Error('No se pudo conectar al servidor'));
    }
    return Promise.reject(error);
  }
);

export default api;
