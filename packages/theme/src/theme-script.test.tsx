import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeScript, generateThemeInlineScript } from "./theme-script";
import {
  STORAGE_KEY_MODE,
  STORAGE_KEY_VARIANT,
  DATA_ATTRIBUTE_THEME,
  DATA_ATTRIBUTE_MOTION,
} from "./types";

describe("ThemeScript", () => {
  it("renders a style element with correct id", () => {
    const { container } = render(<ThemeScript />);
    const style = container.querySelector("style#eaip-theme-variables");
    expect(style).toBeTruthy();
  });

  it("renders a script element", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    expect(script).toBeTruthy();
  });

  it("includes all 5 theme CSS variables in the style", () => {
    const { container } = render(<ThemeScript />);
    const style = container.querySelector("style#eaip-theme-variables");
    const css = style?.textContent ?? "";
    expect(css).toContain("enterprise-light");
    expect(css).toContain("enterprise-dark");
    expect(css).toContain("executive-glass");
    expect(css).toContain("midnight");
    expect(css).toContain("high-contrast");
  });

  it("includes reduced motion CSS in the style", () => {
    const { container } = render(<ThemeScript />);
    const style = container.querySelector("style#eaip-theme-variables");
    const css = style?.textContent ?? "";
    expect(css).toContain("data-reduced-motion");
    expect(css).toContain("animation-duration: 0.01ms");
  });

  it("includes CSS variable declarations", () => {
    const { container } = render(<ThemeScript />);
    const style = container.querySelector("style#eaip-theme-variables");
    const css = style?.textContent ?? "";
    expect(css).toContain("--color-surface");
    expect(css).toContain("--color-text");
    expect(css).toContain("--color-primary");
  });

  it("script references localStorage keys", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    const content = script?.textContent ?? "";
    expect(content).toContain(STORAGE_KEY_MODE);
    expect(content).toContain(STORAGE_KEY_VARIANT);
  });

  it("script references data attributes", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    const content = script?.textContent ?? "";
    expect(content).toContain(DATA_ATTRIBUTE_THEME);
    expect(content).toContain(DATA_ATTRIBUTE_MOTION);
  });

  it("script checks prefers-color-scheme", () => {
    const { container } = render(<ThemeScript defaultMode="system" />);
    const script = container.querySelector("script");
    const content = script?.textContent ?? "";
    expect(content).toContain("prefers-color-scheme: dark");
  });

  it("script checks prefers-reduced-motion", () => {
    const { container } = render(<ThemeScript />);
    const script = container.querySelector("script");
    const content = script?.textContent ?? "";
    expect(content).toContain("prefers-reduced-motion");
  });

  it("accepts defaultMode and defaultVariant props", () => {
    const { container } = render(
      <ThemeScript defaultMode="dark" defaultVariant="midnight" />,
    );
    const script = container.querySelector("script");
    const content = script?.textContent ?? "";
    expect(content).toContain("dark");
    expect(content).toContain("midnight");
  });
});

describe("generateThemeInlineScript", () => {
  it("returns a string containing IIFE", () => {
    const result = generateThemeInlineScript();
    expect(result).toContain("(function(){");
    expect(result).toContain("})();");
  });

  it("includes default mode when provided", () => {
    const result = generateThemeInlineScript("dark");
    expect(result).toContain('"dark"');
  });

  it("includes default variant when provided", () => {
    const result = generateThemeInlineScript("system", "midnight");
    expect(result).toContain("midnight");
  });

  it("includes localStorage key references", () => {
    const result = generateThemeInlineScript();
    expect(result).toContain(STORAGE_KEY_MODE);
    expect(result).toContain(STORAGE_KEY_VARIANT);
  });

  it("handles errors gracefully with try/catch", () => {
    const result = generateThemeInlineScript();
    expect(result).toContain("try{");
    expect(result).toContain("}catch(e){}");
  });
});
