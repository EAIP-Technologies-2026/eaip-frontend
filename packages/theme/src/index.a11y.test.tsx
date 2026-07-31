import { describe, it, expect, beforeAll, vi } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "./provider";
import { themes } from "./themes";
import { THEME_VARIANTS, DATA_ATTRIBUTE_THEME } from "./types";
import type { ThemeVariant } from "./types";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  const style = document.createElement("style");
  style.id = "eaip-theme-variables";
  document.head.appendChild(style);
});

function ThemePreview({ variant }: { variant: ThemeVariant }) {
  return (
    <ThemeProvider defaultMode={themes[variant].scheme} defaultVariant={variant}>
      <div
        style={{
          padding: "2rem",
          background: "var(--color-surface-secondary)",
          color: "var(--color-text)",
        }}
      >
        <h1 style={{ color: "var(--color-text)" }}>{themes[variant].name}</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          This preview demonstrates the {themes[variant].name} theme.
        </p>
        <button
          type="button"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-text-inverse)",
            border: "none",
            borderRadius: "var(--radius-button)",
            padding: "0.5rem 1rem",
            cursor: "pointer",
          }}
        >
          Primary Action
        </button>
        <button
          type="button"
          style={{
            background: "var(--color-surface)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-button)",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            marginLeft: "0.5rem",
          }}
        >
          Secondary
        </button>
      </div>
    </ThemeProvider>
  );
}

describe("ThemeProvider accessibility", () => {
  it.each(THEME_VARIANTS)("renders %s without console errors", (variant) => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ThemePreview variant={variant} />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("sets valid data-theme attribute", () => {
    render(<ThemePreview variant="high-contrast" />);
    const attr = document.documentElement.getAttribute(DATA_ATTRIBUTE_THEME);
    expect(THEME_VARIANTS).toContain(attr);
  });

  it("dark schemes add dark class to root", () => {
    render(<ThemePreview variant="enterprise-dark" />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("light schemes do not add dark class", () => {
    render(<ThemePreview variant="enterprise-light" />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("high-contrast theme provides maximum contrast", () => {
    const hc = themes["high-contrast"];
    expect(hc.variables["--color-text"]).toBe("#000000");
    expect(hc.variables["--color-surface"]).toBe("#ffffff");
    expect(hc.variables["--color-border-strong"]).toBe("#000000");
  });
});
