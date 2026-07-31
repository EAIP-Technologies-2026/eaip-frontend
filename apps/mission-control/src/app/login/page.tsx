"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@eaip/auth";
import { LoginShell } from "@eaip/ui-foundation";

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const router = useRouter();

  async function handleSubmit(email: string, password: string) {
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch {
      // Error is already handled by useAuth
    }
  }

  return (
    <LoginShell
      appName="Mission Control"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onClearError={clearError}
    />
  );
}
