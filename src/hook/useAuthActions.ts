import { useState } from 'react';
import api from '../api/axiosClient'; // Tu instancia de Axios
import { normalizeApiError } from '../api/errors';
import { useAuth } from '../context/AuthContext';

export const useAuthActions = () => {
  const { login: saveAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/login', { email, password });

      // 1. Intentar obtener el token del header 'authorization' 
      // Nota: Axios pone los nombres de los headers en minúsculas por defecto
      let token = response.headers['authorization'];

      // 2. Si el header viene como "Bearer <token>", limpiamos el prefijo
      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        console.error("Headers recibidos:", response.headers);
        throw new Error("No se encontró el token en los headers de la respuesta");
      }

      saveAuth(token);
      return true;
    } catch (err: unknown) {
      setError(normalizeApiError(err, 'Usuario o contraseña incorrectos'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export { useAuth };
