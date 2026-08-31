"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@eaip/auth";
import { LoginShell } from "@eaip/ui-foundation";

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(email: string, password: string) {
    setSubmitting(true);
    try {
      if (await login({ email, password })) {
        router.push("/dashboard");
      }
    } catch {
      // Error is already handled by useAuth
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LoginShell
      appName="Workspace"
      onSubmit={handleSubmit}
      loading={submitting}
      error={error}
      onClearError={clearError}
    />
  );
}
