"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AuthProvider, tokenProvider, useAuth } from "@eaip/auth";
import { ThemeProvider } from "@eaip/theme";
import { createDefaultClient, setDefaultClient } from "@eaip/api";
import { getConfig } from "@eaip/config";
import { usePlatformStore } from "@eaip/state";

const config = getConfig();
setDefaultClient(createDefaultClient({ baseUrl: config.apiUrl, tokenProvider }));

function PlatformStateSync({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const setUser = usePlatformStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

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
        <PlatformStateSync>{children}</PlatformStateSync>
      </AuthProvider>
    </ThemeProvider>
  );
}
