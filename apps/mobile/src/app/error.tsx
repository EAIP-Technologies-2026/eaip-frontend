"use client";

import { useEffect } from "react";
import { logger } from "@eaip/logging";
import { ErrorState, EAIPAtmosphere } from "@eaip/ui-enterprise";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Application error boundary caught an error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <EAIPAtmosphere intensity="dashboard" showParticles={false} />
      <div className="relative z-10 w-full max-w-md">
        <ErrorState
          title="Something went wrong"
          message={error.message || "An unexpected error occurred."}
          onRetry={reset}
          className="w-full"
        />
      </div>
    </main>
  );
}
