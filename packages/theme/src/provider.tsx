"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { ReactNode } from "react";
import type { Theme, ThemeMode, ThemeVariant } from "./types";
import { resolveVariant } from "./themes";
import { generateAllThemesCSS, reducedMotionCSS } from "./css-utils";
import {
  STORAGE_KEY_MODE,
  STORAGE_KEY_VARIANT,
  DATA_ATTRIBUTE_THEME,
  DATA_ATTRIBUTE_MOTION,
  STYLE_ELEMENT_ID,
} from "./types";

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultVariant?: ThemeVariant;
}

interface ThemeState {
  mode: ThemeMode;
  variant: ThemeVariant;
  reducedMotion: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

function getSystemScheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getStoredValue<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return stored as T;
  } catch {
    void 0;
  }
  return fallback;
}

function injectThemeStyles(): () => void {
  if (typeof document === "undefined") return () => void 0;

  const existing = document.getElementById(STYLE_ELEMENT_ID);
  if (existing) return () => void 0;

  const style = document.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = generateAllThemesCSS() + reducedMotionCSS;
  document.head.appendChild(style);
  return () => {
    const el = document.getElementById(STYLE_ELEMENT_ID);
    if (el) el.remove();
  };
}

function applyThemeToDOM(variant: ThemeVariant, scheme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute(DATA_ATTRIBUTE_THEME, variant);
  root.classList.toggle("dark", scheme === "dark");
}

function applyReducedMotionToDOM(reduced: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(
    DATA_ATTRIBUTE_MOTION,
    reduced.toString(),
  );
}

export function ThemeProvider({
  children,
  defaultMode = "system",
  defaultVariant,
}: ThemeProviderProps) {
  const initialVariant = useMemo(
    () => resolveVariant(defaultVariant ?? getStoredValue(STORAGE_KEY_VARIANT, "enterprise-light")),
    [defaultVariant],
  );

  const initialMode = useMemo(
    () => getStoredValue<ThemeMode>(STORAGE_KEY_MODE, defaultMode),
    [defaultMode],
  );

  const [state, setState] = useState<ThemeState>(() => ({
    mode: initialMode,
    variant: initialVariant,
    reducedMotion: getReducedMotion(),
  }));

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const scheme =
      state.mode === "system" ? getSystemScheme() : state.mode;
    applyThemeToDOM(state.variant, scheme);
    applyReducedMotionToDOM(state.reducedMotion);
  }, [state.variant, state.mode, state.reducedMotion]);

  useEffect(() => {
    return injectThemeStyles();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (stateRef.current.mode === "system") {
        const scheme = mq.matches ? "dark" : "light";
        applyThemeToDOM(stateRef.current.variant, scheme);
      }
    };
    mq.addEventListener("change", handler);
    return () => { mq.removeEventListener("change", handler); };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      const reduced = mq.matches;
      setState((prev) => ({ ...prev, reducedMotion: reduced }));
      applyReducedMotionToDOM(reduced);
    };
    mq.addEventListener("change", handler);
    return () => { mq.removeEventListener("change", handler); };
  }, []);

  const resolved: "light" | "dark" =
    state.mode === "system" ? getSystemScheme() : state.mode;

  const setMode = useCallback((newMode: ThemeMode) => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, newMode);
    } catch {
      void 0;
    }
    setState((prev) => ({ ...prev, mode: newMode }));
  }, []);

  const setVariant = useCallback((newVariant: ThemeVariant) => {
    try {
      localStorage.setItem(STORAGE_KEY_VARIANT, newVariant);
    } catch {
      void 0;
    }
    setState((prev) => ({ ...prev, variant: newVariant }));
  }, []);

  const toggle = useCallback(() => {
    const next = resolved === "dark" ? "light" : "dark";
    setMode(next);
  }, [setMode, resolved]);

  const value = useMemo<Theme>(
    () => ({
      mode: state.mode,
      resolved,
      variant: state.variant,
      setMode,
      setVariant,
      toggle,
      reducedMotion: state.reducedMotion,
    }),
    [state, resolved, setMode, setVariant, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
