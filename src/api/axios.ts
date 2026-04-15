import axios from 'axios';

const api = axios.create({
  baseURL:
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? 'https://tkuido.exatronclouds.com'
      : 'http://tkuido.exatronclouds.com', // Ajusta al dominio de tu server
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  },
});

// Interceptor para inyectar el token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores globales (ej: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url ?? "");
    const isLoginRequest = /(^|\/)login(\?|$)/.test(requestUrl);

    if (status === 401 && !isLoginRequest) {
      // Si la API dice que el token no sirve, limpiamos y redirigimos al root del app.
      localStorage.removeItem('token');
      const base = import.meta.env.BASE_URL || '/';
      const normalizedBase = base.endsWith('/') ? base : `${base}/`;
      window.location.href = normalizedBase;
    }
    return Promise.reject(error);
  }
);

export default api;