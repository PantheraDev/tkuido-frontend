// src/hooks/useAxios.ts
import { useState, useEffect, useCallback } from "react";
import { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import axiosClient from "../api/axiosClient"; // Asegúrate de que la ruta sea correcta

interface UseAxiosOptions extends AxiosRequestConfig {
  manual?: boolean; // true = No se ejecuta al cargar (para botones, formularios, etc.)
}

interface UseAxiosResult<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
  // execute ahora devuelve una Promesa con los datos (T) para que puedas usar await en el componente
  execute: (configOverride?: AxiosRequestConfig) => Promise<T>;
}

export const useAxios = <T = unknown>(
  url: string,
  options: UseAxiosOptions = {},
): UseAxiosResult<T> => {
  const [data, setData] = useState<T | null>(null);
  // Si es manual, no carga al inicio. Si es automático, empieza cargando.
  const [loading, setLoading] = useState<boolean>(!options.manual);
  const [error, setError] = useState<AxiosError | null>(null);

  const execute = useCallback(
    async (configOverride?: AxiosRequestConfig): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        // Combinamos la URL del hook con las opciones iniciales y los overrides del momento
        const response: AxiosResponse<T> = await axiosClient({
          url,
          ...options,
          ...configOverride,
        });

        setData(response.data);
        return response.data; // Retornamos los datos para uso inmediato (ej. descargar zip)
      } catch (err) {
        const errorObj = err as AxiosError;
        setError(errorObj);
        throw errorObj; // Re-lanzamos el error por si quieres capturarlo en el componente
      } finally {
        setLoading(false);
      }
    },
    [url, options],
  );

  // Efecto para ejecución automática (GET al cargar página)
  useEffect(() => {
    if (!options.manual) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.manual]);

  return { data, loading, error, execute };
};
