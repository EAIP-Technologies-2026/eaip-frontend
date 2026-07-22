import type { AuthTokens } from "./types";

const TOKEN_KEY = "eaip_access_token";
const REFRESH_TOKEN_KEY = "eaip_refresh_token";

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  const accessToken = window.localStorage.getItem(TOKEN_KEY);
  if (!accessToken) return null;
  return {
    accessToken,
    refreshToken: window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined,
  };
}

export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function tokenProvider(): string | null {
  return getStoredTokens()?.accessToken ?? null;
}
