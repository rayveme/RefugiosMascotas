import axios, { AxiosError, type AxiosInstance } from 'axios';
import { authStorage } from '../services/auth.service';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// No fijamos `Content-Type` global: axios lo decide solo según el payload
// (`application/json` para objetos, `multipart/form-data; boundary=...` para FormData).
// Forzarlo aquí rompía los uploads de imagen.
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response?.status === 401) {
      authStorage.clear();
    }
    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown, fallback = 'Algo salió mal'): string {
  if (axios.isAxiosError<{ detail?: unknown }>(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      // Errores de validación de Pydantic 422 — array de {loc, msg, type, ...}.
      const msgs = detail
        .map((d) => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : null))
        .filter(Boolean);
      if (msgs.length) return msgs.join(' · ');
    }
    return err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
