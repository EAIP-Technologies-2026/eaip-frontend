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
  DATA_ATTRIBUTE_MODE,
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

function normalizeMode(raw: string | null | undefined, fallback: ThemeMode = "light"): ThemeMode {
  if (!raw) return fallback;
  const clean = raw.toLowerCase().trim();
  if (clean === "vibe" || clean === "v" || clean === "system" || clean === "s") return "vibe";
  if (clean === "dark" || clean === "d") return "dark";
  if (clean === "light" || clean === "l") return "light";
  return fallback;
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

function applyThemeToDOM(variant: ThemeVariant, mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute(DATA_ATTRIBUTE_THEME, variant);
  root.setAttribute(DATA_ATTRIBUTE_MODE, mode);
  root.classList.toggle("dark", mode === "dark" || mode === "vibe");
  root.classList.toggle("vibe-mode", mode === "vibe");
}

function applyReducedMotionToDOM(reduced: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(DATA_ATTRIBUTE_MOTION, reduced.toString());
}

export function ThemeProvider({
  children,
  defaultMode = "light",
  defaultVariant,
}: ThemeProviderProps) {
  const initialVariant = useMemo(
    () => resolveVariant(defaultVariant ?? "enterprise-light"),
    [defaultVariant],
  );

  const initialMode = useMemo(() => normalizeMode(defaultMode, defaultMode), [defaultMode]);

  const [state, setState] = useState<ThemeState>(() => ({
    mode: initialMode,
    variant: initialVariant,
    reducedMotion: getReducedMotion(),
  }));

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    applyThemeToDOM(state.variant, state.mode);
    applyReducedMotionToDOM(state.reducedMotion);
  }, [state.variant, state.mode, state.reducedMotion]);

  useEffect(() => {
    setState((previous) => ({
      ...previous,
      mode: normalizeMode(getStoredValue<string>(STORAGE_KEY_MODE, defaultMode), defaultMode),
      variant: resolveVariant(
        defaultVariant ?? getStoredValue<ThemeVariant>(STORAGE_KEY_VARIANT, "enterprise-light"),
      ),
      reducedMotion: getReducedMotion(),
    }));
  }, [defaultMode, defaultVariant]);

  useEffect(() => {
    return injectThemeStyles();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      const reduced = mq.matches;
      setState((prev) => ({ ...prev, reducedMotion: reduced }));
      applyReducedMotionToDOM(reduced);
    };
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
    };
  }, []);

  const resolved = state.mode;

  const setMode = useCallback((newMode: ThemeMode) => {
    const valid = normalizeMode(newMode, "light");
    try {
      localStorage.setItem(STORAGE_KEY_MODE, valid);
    } catch {
      void 0;
    }
    setState((prev) => ({ ...prev, mode: valid }));
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
    setState((prev) => {
      const next: ThemeMode =
        prev.mode === "light" ? "dark" : prev.mode === "dark" ? "vibe" : "light";
      try {
        localStorage.setItem(STORAGE_KEY_MODE, next);
      } catch {
        void 0;
      }
      return { ...prev, mode: next };
    });
  }, []);

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
