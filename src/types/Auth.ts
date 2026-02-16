export interface LoginResponse {
  access_token: string;
  // Agrega aquí otros campos si tu API devuelve más (ej. user: {...})
}

export interface ApiError {
  message: string | string[];
  error: string;
  statusCode: number;
}