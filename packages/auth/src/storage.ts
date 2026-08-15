import type { AuthTokens } from "./types";

const TOKEN_KEY = "eaip_access_token";
const REFRESH_TOKEN_KEY = "eaip_refresh_token";

const memoryStore = new Map<string, string>();

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    if (typeof window.localStorage.getItem === "function") {
      return window.localStorage;
    }
  } catch {
    // localStorage disabled or restricted
  }
  return {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStore.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStore.delete(key);
    },
    clear: () => {
      memoryStore.clear();
    },
    length: memoryStore.size,
    key: (index: number) => Array.from(memoryStore.keys())[index] ?? null,
  };
}

export function getStoredTokens(): AuthTokens | null {
  const storage = getStorage();
  if (!storage) return null;
  const accessToken = storage.getItem(TOKEN_KEY);
  if (!accessToken) return null;
  return {
    accessToken,
    refreshToken: storage.getItem(REFRESH_TOKEN_KEY) ?? undefined,
  };
}

export function storeTokens(tokens: AuthTokens): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(TOKEN_KEY, tokens.accessToken);
  if (tokens.refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export function clearStoredTokens(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}

export function tokenProvider(): string | null {
  return getStoredTokens()?.accessToken ?? null;
}
