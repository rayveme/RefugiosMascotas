import type { Role } from '../types/api';

const TOKEN_KEY = 'huella.token';
const ROLE_KEY = 'huella.role';

export interface OAuthHashResult {
  token?: string;
  role?: Role;
  error?: string;
}

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRole(): Role | null {
    const v = localStorage.getItem(ROLE_KEY);
    return v === 'adopter' || v === 'foundation' || v === 'admin' ? v : null;
  },
  set(token: string, role: Role) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  /**
   * Si el front fue abierto por el callback de Google (URL con #token=...&role=...),
   * lee el hash, guarda el token y devuelve lo que encontró. NO modifica la URL —
   * eso lo hace el componente de routing con `navigate('/', { replace: true })`.
   */
  consumeOAuthHash(): OAuthHashResult {
    if (typeof window === 'undefined') return {};
    const raw = window.location.hash;
    if (!raw || (!raw.includes('token=') && !raw.includes('error='))) return {};

    const params = new URLSearchParams(raw.startsWith('#') ? raw.slice(1) : raw);
    const token = params.get('token') ?? undefined;
    const roleRaw = params.get('role');
    const role: Role | undefined =
      roleRaw === 'adopter' || roleRaw === 'foundation' ? roleRaw : undefined;
    const error = params.get('error') ?? undefined;

    if (token && role) {
      this.set(token, role);
    }

    return { token, role, error };
  },
};
