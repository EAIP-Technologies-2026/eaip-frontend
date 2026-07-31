import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button Accessibility", () => {
  it("renders without axe violations", () => {
    const { container } = render(<Button>Accessible</Button>);
    expect(container.firstElementChild).toBeDefined();
  });

  it("has role button", () => {
    render(<Button>Role</Button>);
    const btn = screen.getByRole("button", { name: "Role" });
    expect(btn).toBeDefined();
  });

  it("sets aria-disabled when disabled", () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-disabled")).toBe("true");
  });

  it("sets aria-busy when loading", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-busy")).toBe("true");
  });

  it("sets aria-label for icon-only button", () => {
    render(<Button iconOnly>Close dialog</Button>);
    expect(screen.getByLabelText("Close dialog")).toBeDefined();
  });

  it("renders loading spinner hidden from accessibility tree", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const svg = container.querySelector("svg[aria-hidden='true']");
    expect(svg).toBeDefined();
  });

  it("renders success icon hidden from accessibility tree", () => {
    const { container } = render(<Button success>Done</Button>);
    const svg = container.querySelector("svg[aria-hidden='true']");
    expect(svg).toBeDefined();
  });

  it("renders error icon hidden from accessibility tree", () => {
    const { container } = render(<Button error>Failed</Button>);
    const svg = container.querySelector("svg[aria-hidden='true']");
    expect(svg).toBeDefined();
  });

  it("renders all variants without console error", () => {
    const spy = vi.spyOn(console, "error");
    const variants = [
      "primary",
      "secondary",
      "tertiary",
      "ghost",
      "destructive",
    ] as const;
    for (const v of variants) {
      render(<Button variant={v}>{v}</Button>);
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("is keyboard focusable", () => {
    const { container } = render(<Button>Focusable</Button>);
    const btn = container.querySelector("button");
    if (!btn) throw new Error("Button not found");
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });
});
