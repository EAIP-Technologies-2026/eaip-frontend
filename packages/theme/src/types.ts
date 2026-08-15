import type { ReactNode } from "react";

export type ThemeVariant =
  | "enterprise-light"
  | "enterprise-dark"
  | "executive-glass"
  | "midnight"
  | "high-contrast";

export type ThemeMode = "light" | "dark" | "vibe";

export type ColorScheme = "light" | "dark" | "vibe";

export interface ThemeDefinition {
  name: string;
  scheme: ColorScheme;
  variables: Record<string, string>;
}

export interface Theme {
  mode: ThemeMode;
  resolved: ColorScheme;
  variant: ThemeVariant;
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  toggle: () => void;
  reducedMotion: boolean;
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  defaultVariant?: ThemeVariant;
}

export const THEME_VARIANTS: ThemeVariant[] = [
  "enterprise-light",
  "enterprise-dark",
  "executive-glass",
  "midnight",
  "high-contrast",
];

export const STORAGE_KEY_MODE = "eaip-theme";
export const STORAGE_KEY_VARIANT = "eaip-theme-variant";
export const DATA_ATTRIBUTE_THEME = "data-theme";
export const DATA_ATTRIBUTE_MODE = "data-theme-mode";
export const DATA_ATTRIBUTE_MOTION = "data-reduced-motion";
export const STYLE_ELEMENT_ID = "eaip-theme-variables";

