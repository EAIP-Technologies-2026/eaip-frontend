"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface FallbackContextType {
  isFallback: boolean;
  fallbackServices: string[];
  setFallback: (service: string, fallback: boolean) => void;
  clearFallback: () => void;
}

const FallbackContext = createContext<FallbackContextType | null>(null);

export function FallbackProvider({ children }: { children: ReactNode }) {
  const [fallbackServices, setFallbackServices] = useState<string[]>([]);

  const setFallback = useCallback((service: string, fallback: boolean) => {
    setFallbackServices((prev) => {
      if (fallback) return prev.includes(service) ? prev : [...prev, service];
      return prev.filter((s) => s !== service);
    });
  }, []);

  const clearFallback = useCallback(() => {
    setFallbackServices([]);
  }, []);

  return (
    <FallbackContext.Provider
      value={{
        isFallback: fallbackServices.length > 0,
        fallbackServices,
        setFallback,
        clearFallback,
      }}
    >
      {children}
    </FallbackContext.Provider>
  );
}

export function useFallback(): FallbackContextType {
  const ctx = useContext(FallbackContext);
  if (!ctx) throw new Error("useFallback must be used within a FallbackProvider");
  return ctx;
}
