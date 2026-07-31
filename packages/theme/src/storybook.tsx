"use client";

import type { ReactNode, ComponentType } from "react";
import { ThemeProvider } from "./provider";
import type { ThemeVariant } from "./types";

export interface WithThemeOptions {
  defaultMode?: "light" | "dark" | "system";
  defaultVariant?: ThemeVariant;
}

export function withTheme(options: WithThemeOptions = {}) {
  const { defaultMode = "system", defaultVariant } = options;
  const Wrapper = (Story: ComponentType<Record<string, unknown>> | (() => ReactNode)) => (
    <ThemeProvider defaultMode={defaultMode} defaultVariant={defaultVariant}>
      {typeof Story === "function" && "prototype" in Story ? (
        <Story />
      ) : typeof Story === "function" ? (
        (Story as () => ReactNode)()
      ) : (
        Story
      )}
    </ThemeProvider>
  );
  Wrapper.displayName = "WithTheme";
  return Wrapper;
}

export function createThemeDecorator(options: WithThemeOptions = {}) {
  return withTheme(options);
}

export const defaultDecorator = withTheme();
