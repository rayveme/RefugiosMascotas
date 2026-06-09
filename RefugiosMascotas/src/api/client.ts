import axios, { AxiosError, type AxiosInstance } from 'axios';
import { authCallbacks, authStorage } from '../services/auth.service';

const baseURL = import.meta.env.VITE_API_URL
  ?? (import.meta.env.PROD ? 'https://refugiosmascotas-production.up.railway.app' : 'http://localhost:8000');

// No fijamos `Content-Type` global: axios lo decide solo según el payload
// (`application/json` para objetos, `multipart/form-data; boundary=...` para FormData).
// Forzarlo aquí rompía los uploads de imagen.
export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,  // 30s — cubre cold starts de Railway
});

// Cliente con timeout extendido para uploads de archivos desde redes móviles lentas.
export const uploadClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 120_000,  // 2 minutos
});

function attachAuthInterceptors(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ detail?: string }>) => {
      if (error.response?.status === 401) {
        authStorage.clear();
        authCallbacks.triggerUnauthorized();
      }
      return Promise.reject(error);
    },
  );
}

attachAuthInterceptors(apiClient);
attachAuthInterceptors(uploadClient);

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
