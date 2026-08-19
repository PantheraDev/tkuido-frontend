// src/api/password.ts
// Consumo del flujo de recuperación de contraseña (Flujo 2 del plan Resend).
// El frontend NO envía correos: el backend dispara el correo con el código
// como efecto del POST /password/forgot. Aquí solo consumimos los endpoints.
import api from "./axiosClient";

// Reexportado para no romper a los consumidores existentes; vive en
// src/api/errors.ts porque lo usa toda la capa `api/`, no solo password.
export { normalizeApiError } from "./errors";

// Paso 1 — Solicitar código. El backend responde SIEMPRE 200 con un mensaje
// genérico (anti-enumeración): el front no puede saber si el correo existe.
export const forgotPassword = async (email: string): Promise<void> => {
  await api.post("/password/forgot", { email });
};

// Paso 2 — Confirmar nueva contraseña con el código recibido.
export const resetPassword = async (params: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> => {
  await api.post("/password/reset", params);
};
