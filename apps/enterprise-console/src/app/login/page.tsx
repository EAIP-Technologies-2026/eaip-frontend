"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@eaip/auth";
import { LoginShell } from "@eaip/ui-foundation";

const StableSingularityBackground = dynamic(
  () => import("../../components/StableSingularityBackground"),
  { ssr: false },
);

const DEMO_WORKSPACES = [
  { id: "nova", label: "Nova Mfg" },
  { id: "apex", label: "Apex D2C" },
  { id: "meridian", label: "Meridian" },
];

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(email: string, password: string, workspaceId?: string) {
    setSubmitting(true);
    try {
      if (await login({ email, password, tenantId: workspaceId })) {
        router.replace("/dashboard");
      }
    } catch {
      // Error is already handled by useAuth
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <StableSingularityBackground />
      <LoginShell
        appName="Enterprise Console"
        onSubmit={handleSubmit}
        loading={submitting}
        error={error}
        onClearError={clearError}
        workspaces={DEMO_WORKSPACES}
        defaultWorkspace="nova"
      />
    </>
  );
}
