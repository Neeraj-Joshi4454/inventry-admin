// Token storage strategy: the access token lives only in memory (a module
// variable) — it never touches localStorage, so it can't be read back by a
// future page load or a compromised script that dumps localStorage at
// leisure. The refresh token is persisted in localStorage so a page reload
// doesn't force a fresh login; it's still readable by any script on the
// page (an inherent XSS tradeoff of doing token handling entirely
// client-side, as this app's spec calls for, rather than proxying auth
// through Next.js route handlers with httpOnly cookies). Losing the access
// token on reload is intentional and cheap to recover from: AuthProvider
// exchanges the stored refresh token for a new access token on mount.

const REFRESH_TOKEN_KEY = 'inventry_admin_refresh_token';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }): void {
  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
}

export function clearTokens(): void {
  setAccessToken(null);
  setRefreshToken(null);
}
