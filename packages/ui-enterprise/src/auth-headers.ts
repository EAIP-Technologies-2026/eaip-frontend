/**
 * Shared authenticated fetch helpers for Conductor API clients.
 *
 * Reads the EAIP access token from the auth store (or legacy localStorage
 * keys) so tour / orchestration / investigation clients authenticate the
 * same way the shell chat does. All Conductor endpoints require an
 * authenticated user, so these helpers must be attached to every request.
 */

import { getStoredTokens } from "@eaip/auth";

function readToken(): string | null {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) return tokens.accessToken;
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("eaip_access_token") ??
    localStorage.getItem("eaip_token") ??
    localStorage.getItem("token")
  );
}

export function getAuthHeaders(): Record<string, string> {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getJsonAuthHeaders(): Record<string, string> {
  return { "Content-Type": "application/json", ...getAuthHeaders() };
}