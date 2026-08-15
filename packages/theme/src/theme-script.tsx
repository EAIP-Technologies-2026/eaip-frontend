import type { ThemeMode, ThemeVariant } from "./types";
import {
  STORAGE_KEY_MODE,
  STORAGE_KEY_VARIANT,
  DATA_ATTRIBUTE_THEME,
  DATA_ATTRIBUTE_MODE,
  DATA_ATTRIBUTE_MOTION,
} from "./types";
import { generateAllThemesCSS, reducedMotionCSS } from "./css-utils";
import { resolveVariant } from "./themes";

export interface ThemeScriptProps {
  defaultMode?: ThemeMode;
  defaultVariant?: ThemeVariant;
}

export function ThemeScript({
  defaultMode = "light",
  defaultVariant,
}: ThemeScriptProps) {
  const resolvedVariant = resolveVariant(defaultVariant);

  const inlineScript = [
    "(function(){",
    "try{",
    `var raw=localStorage.getItem("${STORAGE_KEY_MODE}")||"${defaultMode}";`,
    "var m=(raw==='vibe'||raw==='v'||raw==='system'||raw==='s')?'vibe':(raw==='dark'||raw==='d'?'dark':'light');",
    `var v=localStorage.getItem("${STORAGE_KEY_VARIANT}")||"${resolvedVariant}";`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_THEME}",v);`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_MODE}",m);`,
    `document.documentElement.classList.toggle("dark",m==="dark"||m==="vibe");`,
    `document.documentElement.classList.toggle("vibe-mode",m==="vibe");`,
    `var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_MOTION}",r.toString());`,
    "}catch(e){}",
    "})();",
  ].join("");

  return (
    <>
      <style
        id="eaip-theme-variables"
        dangerouslySetInnerHTML={{ __html: generateAllThemesCSS() + reducedMotionCSS }}
      />
      <script dangerouslySetInnerHTML={{ __html: inlineScript }} />
    </>
  );
}

export function generateThemeInlineScript(
  defaultMode: ThemeMode = "light",
  defaultVariant?: ThemeVariant,
): string {
  const resolvedVariant = resolveVariant(defaultVariant);
  return [
    "(function(){",
    "try{",
    `var raw=localStorage.getItem("${STORAGE_KEY_MODE}")||"${defaultMode}";`,
    "var m=(raw==='vibe'||raw==='v'||raw==='system'||raw==='s')?'vibe':(raw==='dark'||raw==='d'?'dark':'light');",
    `var v=localStorage.getItem("${STORAGE_KEY_VARIANT}")||"${resolvedVariant}";`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_THEME}",v);`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_MODE}",m);`,
    `document.documentElement.classList.toggle("dark",m==="dark"||m==="vibe");`,
    `document.documentElement.classList.toggle("vibe-mode",m==="vibe");`,
    `var r=window.matchMedia("(prefers-reduced-motion: reduce)").matches;`,
    `document.documentElement.setAttribute("${DATA_ATTRIBUTE_MOTION}",r.toString());`,
    "}catch(e){}",
    "})();",
  ].join("");
}

