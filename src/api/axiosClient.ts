// src/api/axiosClient.ts
import axios from "axios";

const axiosClient = axios.create({
  // Ajusta esto a la URL de tu backend (ej. http://localhost:8080)
  baseURL:
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://148.113.172.29", // fallback al host público usado en axios.ts
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Inyecta el token automáticamente antes de cada petición
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken"); // O el nombre que uses para guardar el token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosClient;
