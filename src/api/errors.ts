// src/api/errors.ts
// Normalización compartida de errores de la API para toda la capa `api/`.
import type { AxiosError } from "axios";

type ApiErrorBody = { message?: string | string[]; error?: string };

// El backend devuelve `message` como string (error de negocio) o array
// (error de validación). Normalizamos ambos a un solo string para la UI.
export const normalizeApiError = (err: unknown, fallback: string): string => {
  const axiosErr = err as AxiosError<ApiErrorBody>;
  const body = axiosErr.response?.data;
  const msg = body?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg.trim()) return msg;
  if (typeof body?.error === "string" && body.error.trim()) return body.error;
  return fallback;
};
