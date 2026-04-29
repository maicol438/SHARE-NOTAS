import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Interceptor para agregar token de localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("✅ Response success:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method
    });
    
    if (!error.response) {
      console.error("Network Error Details:", {
        message: error.message,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      return Promise.reject(new Error("No se pudo conectar al servidor"));
    }
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
