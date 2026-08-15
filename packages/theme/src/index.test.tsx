import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./provider";
import { themes } from "./themes";
import { THEME_VARIANTS, DATA_ATTRIBUTE_THEME, DATA_ATTRIBUTE_MOTION } from "./types";

function getMatchMediaMock(matches = false) {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: (_event: string, _handler: () => void) => {},
    removeEventListener: (_event: string, _handler: () => void) => {},
    dispatchEvent: () => false,
  });
}

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: getMatchMediaMock(false),
  });

  const store = new Map<string, string>();
  const mockStorage = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
    removeItem: vi.fn((key: string) => { store.delete(key); }),
    clear: vi.fn(() => { store.clear(); }),
    get length() { return store.size; },
    key: vi.fn(() => null),
  };
  Object.defineProperty(window, "localStorage", {
    writable: true,
    value: mockStorage,
  });
  vi.stubGlobal("localStorage", mockStorage);
});

afterEach(() => {
  cleanup();
  document.head.querySelector("#eaip-theme-variables")?.remove();
  try { localStorage.clear(); } catch { /* noop */ }
  document.documentElement.removeAttribute(DATA_ATTRIBUTE_THEME);
  document.documentElement.removeAttribute(DATA_ATTRIBUTE_MOTION);
  document.documentElement.classList.remove("dark");
});

function TestConsumer() {
  const theme = useTheme();
  return (
    <div>
      <span data-testid="mode">{theme.mode}</span>
      <span data-testid="resolved">{theme.resolved}</span>
      <span data-testid="variant">{theme.variant}</span>
      <span data-testid="reduced-motion">{String(theme.reducedMotion)}</span>
      <button data-testid="toggle" onClick={theme.toggle} type="button">
        toggle
      </button>
      <button
        data-testid="set-light"
        onClick={() => { theme.setMode("light"); }}
        type="button"
      >
        light
      </button>
      <button
        data-testid="set-dark"
        onClick={() => { theme.setMode("dark"); }}
        type="button"
      >
        dark
      </button>
      <button
        data-testid="set-vibe"
        onClick={() => { theme.setMode("vibe"); }}
        type="button"
      >
        vibe
      </button>
      <button
        data-testid="set-variant"
        onClick={() => { theme.setVariant("midnight"); }}
        type="button"
      >
        midnight
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  it("renders children", () => {
    render(
      <ThemeProvider>
        <div data-testid="child">hello</div>
      </ThemeProvider>,
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("provides default theme context", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("light");
    expect(screen.getByTestId("variant").textContent).toBe("enterprise-light");
    expect(screen.getByTestId("reduced-motion").textContent).toBe("false");
  });

  it("accepts defaultMode prop", () => {
    render(
      <ThemeProvider defaultMode="dark">
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
  });

  it("accepts vibe mode prop", () => {
    render(
      <ThemeProvider defaultMode="vibe">
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("mode").textContent).toBe("vibe");
    expect(screen.getByTestId("resolved").textContent).toBe("vibe");
    expect(document.documentElement.classList.contains("vibe-mode")).toBe(true);
  });

  it("accepts defaultVariant prop", () => {
    render(
      <ThemeProvider defaultVariant="midnight">
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("variant").textContent).toBe("midnight");
  });

  it("sets data-theme attribute on mount", () => {
    render(
      <ThemeProvider defaultVariant="enterprise-dark">
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute(DATA_ATTRIBUTE_THEME)).toBe(
      "enterprise-dark",
    );
  });

  it("toggles dark class based on mode", () => {
    render(
      <ThemeProvider defaultMode="dark">
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("sets variant via setVariant", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByTestId("set-variant"));
    });
    expect(screen.getByTestId("variant").textContent).toBe("midnight");
    expect(document.documentElement.getAttribute(DATA_ATTRIBUTE_THEME)).toBe("midnight");
  });

  it("sets mode via setMode", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByTestId("set-dark"));
    });
    expect(screen.getByTestId("mode").textContent).toBe("dark");
    expect(screen.getByTestId("resolved").textContent).toBe("dark");

    act(() => {
      fireEvent.click(screen.getByTestId("set-vibe"));
    });
    expect(screen.getByTestId("mode").textContent).toBe("vibe");
    expect(screen.getByTestId("resolved").textContent).toBe("vibe");
  });

  it("toggles in cycle: light -> dark -> vibe -> light", () => {
    render(
      <ThemeProvider defaultMode="light">
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("resolved").textContent).toBe("light");
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(screen.getByTestId("resolved").textContent).toBe("dark");
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(screen.getByTestId("resolved").textContent).toBe("vibe");
    act(() => {
      fireEvent.click(screen.getByTestId("toggle"));
    });
    expect(screen.getByTestId("resolved").textContent).toBe("light");
  });


  it("persists mode to localStorage", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByTestId("set-dark"));
    });
    expect(localStorage.getItem("eaip-theme")).toBe("dark");
  });

  it("persists variant to localStorage", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByTestId("set-variant"));
    });
    expect(localStorage.getItem("eaip-theme-variant")).toBe("midnight");
  });

  it("injects style element with theme CSS", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    const style = document.getElementById("eaip-theme-variables");
    expect(style).toBeTruthy();
    expect(style?.tagName).toBe("STYLE");
  });

  it("throws useTheme without provider", () => {
    function BadComponent() {
      useTheme();
      return null;
    }
    expect(() => render(<BadComponent />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );
  });
});

describe("themes", () => {
  it("exports all 5 theme variants", () => {
    expect(THEME_VARIANTS).toHaveLength(5);
    expect(THEME_VARIANTS).toContain("enterprise-light");
    expect(THEME_VARIANTS).toContain("enterprise-dark");
    expect(THEME_VARIANTS).toContain("executive-glass");
    expect(THEME_VARIANTS).toContain("midnight");
    expect(THEME_VARIANTS).toContain("high-contrast");
  });

  it.each(THEME_VARIANTS)("theme %s has name, scheme, and variables", (variant) => {
    const theme = themes[variant];
    expect(theme).toBeDefined();
    expect(theme.name).toBeTruthy();
    expect(["light", "dark"]).toContain(theme.scheme);
    expect(Object.keys(theme.variables).length).toBeGreaterThan(20);
  });

  it("enterprise-light has expected surface color", () => {
    expect(themes["enterprise-light"].variables["--color-surface"]).toBe("#fafbfc");
  });

  it("enterprise-dark has expected surface color", () => {
    expect(themes["enterprise-dark"].variables["--color-surface"]).toBe("#0a0e17");
  });

  it("midnight has deep navy surface", () => {
    expect(themes.midnight.variables["--color-surface"]).toBe("#050a14");
  });

  it("high-contrast uses squared corners for radii", () => {
    expect(themes["high-contrast"].variables["--radius-card"]).toBe("0px");
    expect(themes["high-contrast"].variables["--radius-button"]).toBe("0px");
  });

  it("all themes define all required CSS variables", () => {
    const required = [
      "--color-surface",
      "--color-surface-secondary",
      "--color-surface-tertiary",
      "--color-surface-elevated",
      "--color-surface-glass",
      "--color-text",
      "--color-text-secondary",
      "--color-text-muted",
      "--color-text-inverse",
      "--color-border",
      "--color-border-subtle",
      "--color-border-strong",
      "--color-primary",
      "--color-primary-hover",
      "--color-primary-subtle",
      "--color-success",
      "--color-success-subtle",
      "--color-warning",
      "--color-warning-subtle",
      "--color-danger",
      "--color-danger-subtle",
      "--radius-card",
      "--radius-button",
      "--radius-input",
      "--shadow-card",
      "--shadow-elevated",
      "--shadow-glow",
    ];
    for (const variant of THEME_VARIANTS) {
      for (const key of required) {
        expect(themes[variant].variables).toHaveProperty(key);
      }
    }
  });
});

describe("reduced motion", () => {
  it("sets data-reduced-motion attribute on html", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute(DATA_ATTRIBUTE_MOTION)).toBe("false");
  });
});
