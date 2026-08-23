// src/utils/apiError.ts
// El backend devuelve mensajes accionables que el usuario necesita ver:
// doble cargo (409), máximo de intentos (429), pasarela caída (503), rechazo
// del banco emisor con su código (400)... Tragárselos y mostrar un genérico
// empuja al cliente a reintentar justo cuando no debe.
import { AxiosError } from "axios";

const DEFAULT_MESSAGE =
  "No se pudo procesar la solicitud. Intenta de nuevo en unos minutos.";

/** Extrae el mensaje de error de una respuesta de la API. */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_MESSAGE,
): string => {
  const axiosError = error as AxiosError<{
    message?: string | string[];
    error?: string;
  }>;

  // Sin respuesta: timeout, DNS, CORS o el usuario sin conexión.
  if (axiosError?.isAxiosError && !axiosError.response) {
    return "No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.";
  }

  const data = axiosError?.response?.data;
  const message = data?.message ?? data?.error;

  // class-validator devuelve un array de mensajes cuando falla el DTO.
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(". ") || fallback;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

/**
 * true si el error deja el cobro en un estado incierto: no se debe invitar a
 * reintentar sin que el usuario verifique antes su estado de cuenta.
 */
export const esErrorDeCobroIncierto = (error: unknown): boolean => {
  const status = (error as AxiosError)?.response?.status;
  return status === 409 || status === 429 || status === 502 || status === 503;
};
