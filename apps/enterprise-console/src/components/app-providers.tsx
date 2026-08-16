"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, useAuth, getStoredTokens } from "@eaip/auth";
import { ThemeProvider } from "@eaip/theme";
import { createDefaultClient, setDefaultClient } from "@eaip/api";
import { usePlatformStore } from "@eaip/state";
import { createMockNotifications } from "../mock-data/data";
import { getApiConfig } from "../config/api";
import { FallbackProvider, useFallback } from "../services/fallback-context";
import { WebSocketRealtimeClient } from "@eaip/realtime";

const config = getApiConfig();
const wsUrl = config.baseUrl.replace(/^http/, "ws") + "/ws";

const realtimeClient = new WebSocketRealtimeClient({
  url: wsUrl,
  tokenProvider: () => {
    const tokens = getStoredTokens();
    return tokens?.accessToken ?? null;
  },
});
realtimeClient.connect();

setDefaultClient(
  createDefaultClient({
    baseUrl: config.baseUrl,
    tokenProvider: () => {
      const tokens = getStoredTokens();
      return tokens?.accessToken ?? null;
    },
  }),
);

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