import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { adoptersApi } from '../api/adopters';
import { authApi } from '../api/auth';
import { foundationsApi } from '../api/foundations';
import { authStorage } from '../services/auth.service';
import type {
  AdopterRegisterPayload,
  FoundationRegisterPayload,
  LoginPayload,
  Role,
} from '../types/api';
import type { AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  oauthError: string | null;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  registerAdopter: (payload: AdopterRegisterPayload) => Promise<AuthUser>;
  registerFoundation: (payload: FoundationRegisterPayload) => Promise<AuthUser>;
  refresh: () => Promise<void>;
  logout: () => void;
  clearOAuthError: () => void;
  setOAuthError: (err: string | null) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(role: Role): Promise<AuthUser> {
  if (role === 'adopter') {
    const profile = await adoptersApi.me();
    return { role, profile };
  }
  const profile = await foundationsApi.me();
  return { role, profile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(authStorage.getToken()));
  const [oauthError, setOAuthError] = useState<string | null>(null);

  const setOAuthErrorPublic = useCallback((err: string | null) => setOAuthError(err), []);

  const refresh = useCallback(async () => {
    const role = authStorage.getRole();
    const token = authStorage.getToken();
    if (!role || !token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const next = await loadProfile(role);
      setUser(next);
    } catch {
      authStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const clearOAuthError = useCallback(() => setOAuthError(null), []);

  const adoptToken = useCallback(
    async (token: string, role: Role): Promise<AuthUser> => {
      authStorage.set(token, role);
      const next = await loadProfile(role);
      setUser(next);
      return next;
    },
    [],
  );

  const login = useCallback<AuthContextValue['login']>(
    async (payload) => {
      const { access_token, role } = await authApi.login(payload);
      return adoptToken(access_token, role);
    },
    [adoptToken],
  );

  const registerAdopter = useCallback<AuthContextValue['registerAdopter']>(
    async (payload) => {
      const { access_token, role } = await authApi.registerAdopter(payload);
      return adoptToken(access_token, role);
    },
    [adoptToken],
  );

  const registerFoundation = useCallback<AuthContextValue['registerFoundation']>(
    async (payload) => {
      const { access_token, role } = await authApi.registerFoundation(payload);
      return adoptToken(access_token, role);
    },
    [adoptToken],
  );

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      oauthError,
      login,
      registerAdopter,
      registerFoundation,
      refresh,
      logout,
      clearOAuthError,
      setOAuthError: setOAuthErrorPublic,
    }),
    [user, loading, oauthError, login, registerAdopter, registerFoundation, refresh, logout, clearOAuthError, setOAuthErrorPublic],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
