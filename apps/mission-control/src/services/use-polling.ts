"use client";

import { useEffect, useRef, useCallback } from "react";

export interface PollingOptions {
  intervalMs: number;
  enabled?: boolean;
  onError?: (error: unknown) => void;
}

export function usePolling(
  callback: () => Promise<void> | void,
  { intervalMs, enabled = true, onError }: PollingOptions,
) {
  const savedCallback = useRef(callback);
  const savedOnError = useRef(onError);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  savedCallback.current = callback;
  savedOnError.current = onError;

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    intervalRef.current = setInterval(() => {
      void Promise.resolve().then(async () => {
        try {
          await savedCallback.current();
        } catch (err) {
          savedOnError.current?.(err);
        }
      });
    }, intervalMs);
  }, [intervalMs, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  return { start, stop };
}
