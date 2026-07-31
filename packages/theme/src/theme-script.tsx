import type { ThemeMode, ThemeVariant } from "./types";
import {
  STORAGE_KEY_MODE,
  STORAGE_KEY_VARIANT,
  DATA_ATTRIBUTE_THEME,
  DATA_ATTRIBUTE_MOTION,
} from "./types";
import { generateAllThemesCSS, reducedMotionCSS } from "./css-utils";
import { resolveVariant } from "./themes";

export interface ThemeScriptProps {
  defaultMode?: ThemeMode;
  defaultVariant?: ThemeVariant;
}

export function ThemeScript({
  defaultMode = "system",
  defaultVariant,
}: ThemeScriptProps) {
  const resolvedVariant = resolveVariant(defaultVariant);

  const inlineScript = [
    "(function(){",
    "try{",
    `var m=localStorage.getItem("${STORAGE_KEY_MODE}")||"${defaultMode}";`,
    `var v=localStorage.getItem("${STORAGE_KEY_VARIANT}")||"${resolvedVariant}";`,
    `var s=m==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_THEME}",v);`,
    `document.documentElement.classList.toggle("dark",s==="dark");`,
    `var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_MOTION}",r.toString());`,
    "}catch(e){}",
    "})();",
  ].join("");

  return (
    <>
      <style id="eaip-theme-variables">
        {generateAllThemesCSS()}
        {reducedMotionCSS}
      </style>
      <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
    </>
  );
}

export function generateThemeInlineScript(
  defaultMode: ThemeMode = "system",
  defaultVariant?: ThemeVariant,
): string {
  const resolvedVariant = resolveVariant(defaultVariant);
  return [
    "(function(){",
    "try{",
    `var m=localStorage.getItem("${STORAGE_KEY_MODE}")||"${defaultMode}";`,
    `var v=localStorage.getItem("${STORAGE_KEY_VARIANT}")||"${resolvedVariant}";`,
    `var s=m==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_THEME}",v);`,
    `document.documentElement.classList.toggle("dark",s==="dark");`,
    `var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_MOTION}",r.toString());`,
    "}catch(e){}",
    "})();",
  ].join("");
}
