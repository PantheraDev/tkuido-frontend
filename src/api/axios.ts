import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Cambia esto por la IP de tu server Linux
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
    if (error.response?.status === 401) {
      // Si la API dice que el token no sirve, limpiamos y redirigimos
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;