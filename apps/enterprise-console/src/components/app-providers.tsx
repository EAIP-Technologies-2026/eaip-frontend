"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth, getStoredTokens } from "@eaip/auth";
import { ThemeProvider } from "@eaip/theme";
import { createDefaultClient, setDefaultClient } from "@eaip/api";
import { usePlatformStore } from "@eaip/state";
import { installMockApi } from "../mock-data/api-client";
import { createMockNotifications } from "../mock-data/data";
import { getApiConfig, isMockMode } from "../config/api";
import { FallbackProvider, useFallback } from "../services/fallback-context";

const config = getApiConfig();
setDefaultClient(
  createDefaultClient({
    baseUrl: config.baseUrl,
    tokenProvider: () => {
      const tokens = getStoredTokens();
      return tokens?.accessToken ?? null;
    },
  }),
);

// The EAIP console ships a rich mock API for local development. The real
// backend does not implement every console route (several return 401/404),
// so in any non-production mode we install the mock layer to keep the
// experience cohesive and data-backed. Production always uses the live API.
if (isMockMode() || getApiConfig().mode === "development") {
  installMockApi();
}

function FallbackBanner() {
  const { isFallback, fallbackServices } = useFallback();

  if (!isFallback) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-warning/20 bg-warning-subtle px-4 py-2.5 shadow-lg">
      <span className="flex h-2 w-2 rounded-full bg-warning">
        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-warning opacity-75" />
      </span>
      <div className="text-xs text-text">
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
    if (notifications.length === 0) {
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