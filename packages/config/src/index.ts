export interface AppConfig {
  appUrl: string;
  apiUrl: string;
  wsUrl: string;
  environment: "development" | "staging" | "production";
  version: string;
}

export function getConfig(): AppConfig {
  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api",
    wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws",
    environment: (process.env.NODE_ENV ?? "development") as AppConfig["environment"],
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
  };
}

export function isDevelopment(): boolean {
  return getConfig().environment === "development";
}

export function isProduction(): boolean {
  return getConfig().environment === "production";
}
