// src/utils/auth.ts
// Identidad de usuario derivada exclusivamente del JWT. No hay fallback a
// localStorage.getItem("userId"): ese valor es un string plano editable por
// el usuario (o por un XSS) sin ninguna verificación, a diferencia del JWT,
// que al menos está firmado por el backend.
import { jwtDecode } from "jwt-decode";

export type JwtPayload = {
  id?: string | number;
  sub?: string | number;
  idUser?: string | number;
};

export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const candidate = decoded?.sub ?? decoded?.id ?? decoded?.idUser;
    if (candidate === undefined || candidate === null) return null;
    return String(candidate);
  } catch {
    return null;
  }
};
