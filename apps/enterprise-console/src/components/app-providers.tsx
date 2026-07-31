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

if (isMockMode()) {
  installMockApi();
}

function FallbackBanner() {
  const { isFallback, fallbackServices } = useFallback();

  if (!isFallback) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 shadow-lg">
      <span className="flex h-2 w-2 rounded-full bg-amber-400">
        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75" />
      </span>
      <div className="text-xs text-amber-800">
        <p className="font-medium">Connection Issue</p>
        <p className="text-amber-600">
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