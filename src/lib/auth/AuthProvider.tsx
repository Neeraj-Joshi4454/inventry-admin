'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as authApi from '@/lib/api/auth';
import { apiClient, registerAuthFailureHandler } from '@/lib/api/client';
import type { ApiSuccess } from '@/types/api';
import type { RefreshResponse } from '@/types/auth';
import {
  clearTokens,
  getRefreshToken,
  setAccessToken,
  setTokens,
} from '@/lib/auth/tokenStorage';
import type { CurrentUser } from '@/types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: CurrentUser | null;
  status: AuthStatus;
  login: (mobileNumber: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const refreshUser = useCallback(async () => {
    const me = await authApi.fetchCurrentUser();
    setUser(me);
    setStatus('authenticated');
  }, []);

  // On first load, a stored refresh token means "was logged in before" —
  // the access token itself is never persisted (see tokenStorage.ts), so
  // it must be re-derived by exchanging the refresh token first.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }

      try {
        const res = await apiClient.post<ApiSuccess<RefreshResponse>>('/auth/refresh', {
          refreshToken,
        });
        setTokens(res.data.data);
        const me = await authApi.fetchCurrentUser();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        clearTokens();
        if (!cancelled) {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Wired once so the axios interceptor can force a logout when a refresh
  // attempt fails mid-session (e.g. the session was revoked elsewhere).
  useEffect(() => {
    registerAuthFailureHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  const login = useCallback(async (mobileNumber: string, password: string) => {
    const result = await authApi.login(mobileNumber, password);
    setTokens(result);
    const me = await authApi.fetchCurrentUser();
    setUser(me);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Best-effort: even if the revoke call fails (e.g. already expired),
      // the client must still forget its own tokens.
    } finally {
      clearTokens();
      setAccessToken(null);
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, refreshUser }),
    [user, status, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
