"use client";

import { useEffect } from "react";
import { logger } from "@eaip/logging";
import { Button } from "@eaip/ui-primitives";
import * as Sentry from "../lib/sentry";

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
    Sentry.Sentry.captureException(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-text-secondary">{error.message || "An unexpected error occurred."}</p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </main>
  );
}
