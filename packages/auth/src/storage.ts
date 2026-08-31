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
  let accessToken: string | null;
  let refreshToken: string | null;
  try {
    accessToken = storage.getItem(TOKEN_KEY);
    refreshToken = storage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    accessToken = memoryStore.get(TOKEN_KEY) ?? null;
    refreshToken = memoryStore.get(REFRESH_TOKEN_KEY) ?? null;
  }
  if (!accessToken) return null;
  return {
    accessToken,
    refreshToken: refreshToken ?? undefined,
  };
}

export function storeTokens(tokens: AuthTokens): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } else {
      storage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch {
    memoryStore.set(TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      memoryStore.set(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } else {
      memoryStore.delete(REFRESH_TOKEN_KEY);
    }
  }
}

export function clearStoredTokens(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    memoryStore.delete(TOKEN_KEY);
    memoryStore.delete(REFRESH_TOKEN_KEY);
  }
}

export function tokenProvider(): string | null {
  return getStoredTokens()?.accessToken ?? null;
}
