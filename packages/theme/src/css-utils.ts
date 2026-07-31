import { themes } from "./themes";
import type { ThemeVariant } from "./types";
import { DATA_ATTRIBUTE_THEME, DATA_ATTRIBUTE_MOTION } from "./types";

export function generateThemeCSS(variant: ThemeVariant): string {
  const def = themes[variant];
  const vars = Object.entries(def.variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `[${DATA_ATTRIBUTE_THEME}="${variant}"] {\n${vars}\n}\n`;
}

export function generateAllThemesCSS(): string {
  return (Object.keys(themes) as ThemeVariant[])
    .map(generateThemeCSS)
    .join("\n");
}

export const reducedMotionCSS = `
[${DATA_ATTRIBUTE_MOTION}="true"] *,
[${DATA_ATTRIBUTE_MOTION}="true"] *::before,
[${DATA_ATTRIBUTE_MOTION}="true"] *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
`;
