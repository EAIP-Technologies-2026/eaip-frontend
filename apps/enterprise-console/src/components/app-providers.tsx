"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth, tokenProvider } from "@eaip/auth";
import { ThemeProvider } from "@eaip/theme";
import { createDefaultClient, setDefaultClient } from "@eaip/api";
import { usePlatformStore } from "@eaip/state";
import { createMockNotifications } from "../mock-data/data";
import { getApiConfig } from "../config/api";
import { FallbackProvider, useFallback } from "../services/fallback-context";
import { isMockDataEnabled } from "../services/service-result";

const config = getApiConfig();

setDefaultClient(
  createDefaultClient({
    baseUrl: config.baseUrl,
    timeoutMs: config.timeoutMs,
    retries: config.retries,
    retryDelayMs: config.retryDelayMs,
    tokenProvider,
  }),
);

function FallbackBanner() {
  const { isFallback, fallbackServices } = useFallback();

  if (!isFallback) return null;

  return (
    <div className="border-warning/20 bg-warning-subtle fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-2.5 shadow-lg">
      <span className="bg-warning flex h-2 w-2 rounded-full">
        <span className="bg-warning absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-75" />
      </span>
      <div className="text-text text-xs">
        <p className="font-medium">Connection Issue</p>
        <p className="text-warning">
          {fallbackServices.length === 1
            ? `${fallbackServices[0] ?? ""} is using cached data`
            : `${String(fallbackServices.length)} services using cached data`}
        </p>
      </div>
    </div>
  );
}

function PlatformStateSync({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const setUser = usePlatformStore((state) => state.setUser);
  const addNotification = usePlatformStore((state) => state.addNotification);
  const notifications = usePlatformStore((state) => state.notifications);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  useEffect(() => {
    if (isMockDataEnabled() && notifications.length === 0) {
      const seed = createMockNotifications();
      for (const n of seed) {
        addNotification(n);
      }
    }
  }, [notifications.length, addNotification]);

  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider>
      <AuthProvider
        apiUrl={config.baseUrl}
        onSessionExpired={() => {
          router.push("/login");
        }}
      >
        <FallbackProvider>
          <PlatformStateSync>{children}</PlatformStateSync>
          <FallbackBanner />
        </FallbackProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
