export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  switch (level) {
    case "debug":
    case "info":
    case "warn":
      console.warn(entry);
      break;
    case "error":
      console.error(entry);
      break;
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    log("debug", message, data);
  },
  info: (message: string, data?: Record<string, unknown>) => {
    log("info", message, data);
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    log("warn", message, data);
  },
  error: (message: string, data?: Record<string, unknown>) => {
    log("error", message, data);
  },
};
