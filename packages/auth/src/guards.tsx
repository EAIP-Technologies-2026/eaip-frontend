"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context";

function SessionLoading() {
  return (
    <div className="bg-surface-secondary flex min-h-screen items-center justify-center p-4">
      <div className="border-border bg-surface shadow-card flex flex-col items-center gap-4 rounded-xl border p-8">
        <div className="border-border-subtle border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
        <p className="text-text-secondary text-sm">Loading session...</p>
      </div>
    </div>
  );
}

function SessionUnavailable() {
  return (
    <div className="bg-surface-secondary flex min-h-screen items-center justify-center p-4">
      <div className="border-border bg-surface shadow-card rounded-xl border p-8 text-center">
        <p className="text-text-secondary text-sm">The session could not be verified.</p>
        <p className="text-text-muted mt-2 text-xs">Refresh the page when the API is available.</p>
      </div>
    </div>
  );
}

export interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, fallback, redirectTo = "/login" }: RequireAuthProps) {
  const { isAuthenticated, loading, token, error } = useAuth();
  const router = useRouter();
  const sessionUnavailable = Boolean(token && error && !isAuthenticated);

  useEffect(() => {
    if (!loading && !isAuthenticated && !sessionUnavailable) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo, sessionUnavailable]);

  if (loading) {
    return fallback ?? <SessionLoading />;
  }

  if (sessionUnavailable) {
    return fallback ?? <SessionUnavailable />;
  }

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  return children;
}

export interface RequireRoleProps extends RequireAuthProps {
  requiredRole: string;
}

export function RequireRole({
  children,
  requiredRole,
  fallback,
  redirectTo = "/unauthorized",
}: RequireRoleProps) {
  const { isAuthenticated, loading, hasRole, token, error } = useAuth();
  const router = useRouter();
  const sessionUnavailable = Boolean(token && error && !isAuthenticated);

  useEffect(() => {
    if (!loading && !sessionUnavailable && isAuthenticated && !hasRole(requiredRole)) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, hasRole, requiredRole, router, redirectTo, sessionUnavailable]);

  if (loading) {
    return fallback ?? <SessionLoading />;
  }

  if (sessionUnavailable) {
    return fallback ?? <SessionUnavailable />;
  }

  if (!isAuthenticated || !hasRole(requiredRole)) {
    return fallback ?? null;
  }

  return children;
}

export interface RedirectIfAuthenticatedProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RedirectIfAuthenticated({
  children,
  redirectTo = "/dashboard",
}: RedirectIfAuthenticatedProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  if (loading) {
    return <SessionLoading />;
  }

  return children;
}
