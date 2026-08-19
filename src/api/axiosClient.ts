// src/api/axiosClient.ts
import axios from "axios";

// Cliente Axios único de la app. Nunca degrada a HTTP: usa la URL de entorno
// (útil para desarrollo local, ej. http://localhost:8080) o el dominio de
// producción en HTTPS por defecto.
const axiosClient = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "https://tkuido.exatronclouds.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Inyecta el token automáticamente antes de cada petición
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // O el nombre que uses para guardar el token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor: si la API dice que el token no sirve (401), limpiamos la
// sesión y redirigimos al root del app. Se excluye la propia request de
// login para no interferir con el manejo de credenciales inválidas.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url ?? "");
    const isLoginRequest = /(^|\/)login(\?|$)/.test(requestUrl);

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      const base = import.meta.env.BASE_URL || "/";
      const normalizedBase = base.endsWith("/") ? base : `${base}/`;
      window.location.href = normalizedBase;
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
