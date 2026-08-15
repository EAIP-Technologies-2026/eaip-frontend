"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError } from "@eaip/api";
import { logger } from "@eaip/logging";
import type { AuthContextType, AuthState, AuthUser, LoginCredentials } from "./types";
import { createAuthService } from "./service";
import { clearStoredTokens, getStoredTokens, tokenProvider } from "./storage";

const AuthContext = createContext<AuthContextType | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  onSessionExpired?: () => void;
}

export function AuthProvider({ children, onSessionExpired }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
    error: null,
  });

  const authService = useMemo(() => createAuthService(tokenProvider), []);

  const handleSessionExpired = useCallback(() => {
    clearStoredTokens();
    setState({
      user: null,
      token: null,
      loading: false,
      error: "Session expired. Please sign in again.",
    });
    onSessionExpired?.();
  }, [onSessionExpired]);

  useEffect(() => {
    const handler = () => {
      handleSessionExpired();
    };
    window.addEventListener("eaip:session-expired", handler);
    return () => {
      window.removeEventListener("eaip:session-expired", handler);
    };
  }, [handleSessionExpired]);

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        if (mounted) {
          setState((s) => ({ ...s, loading: false }));
        }
        return;
      }

      try {
        let user = await authService.getCurrentUser();
        if (!user && tokens.refreshToken) {
          try {
            const newTokens = await authService.refreshToken(tokens.refreshToken);
            if (newTokens.accessToken) {
              user = await authService.getCurrentUser();
            }
          } catch {
            // Token refresh attempt failed
          }
        }

        if (mounted) {
          if (user) {
            const currentTokens = getStoredTokens();
            setState({ user, token: currentTokens?.accessToken ?? tokens.accessToken, loading: false, error: null });
          } else {
            clearStoredTokens();
            setState({ user: null, token: null, loading: false, error: null });
          }
        }
      } catch (error) {
        logger.error("Failed to restore session", {
          error: error instanceof Error ? error.message : String(error),
        });
        clearStoredTokens();
        if (mounted) {
          setState({ user: null, token: null, loading: false, error: null });
        }
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [authService]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const user = await authService.login(credentials);
        const tokens = getStoredTokens();
        setState({ user, token: tokens?.accessToken ?? null, loading: false, error: null });
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Login failed. Please try again.";
        logger.error("Login failed", { error: message });
        setState({ user: null, token: null, loading: false, error: message });
      }
    },
    [authService],
  );

  const logout = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      await authService.logout();
    } catch (error) {
      logger.error("Logout failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearStoredTokens();
      setState({ user: null, token: null, loading: false, error: null });
    }
  }, [authService]);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const hasRole = useCallback(
    (role: string) => {
      return state.user?.roles.includes(role) ?? false;
    },
    [state.user],
  );

  const value: AuthContextType = useMemo(
    () => ({
      ...state,
      login,
      logout,
      hasRole,
      isAuthenticated: state.user !== null,
      clearError,
    }),
    [state, login, logout, hasRole, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function useCurrentUser(): AuthUser | null {
  return useAuth().user;
}

export function useIsAuthenticated(): boolean {
  return useAuth().isAuthenticated;
}
