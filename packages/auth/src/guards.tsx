"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context";

export interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, fallback, redirectTo = "/login" }: RequireAuthProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  if (loading) {
    return fallback ?? <div>Loading session...</div>;
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
  const { isAuthenticated, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated && !hasRole(requiredRole)) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, hasRole, requiredRole, router, redirectTo]);

  if (loading) {
    return fallback ?? <div>Loading session...</div>;
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
    return <div>Loading session...</div>;
  }

  return children;
}
