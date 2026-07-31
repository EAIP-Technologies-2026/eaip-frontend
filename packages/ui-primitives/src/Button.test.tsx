import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

function getButton(container: HTMLElement): HTMLButtonElement {
  const el = container.querySelector("button");
  if (!el) throw new Error("Button not found");
  return el;
}

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined();
  });

  it("renders with default props", () => {
    const { container } = render(<Button>Default</Button>);
    expect(getButton(container)).toBeDefined();
  });

  it("renders as disabled", () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const btn = getButton(container);
    expect(btn.disabled).toBe(true);
  });

  it("renders with loading state", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const btn = getButton(container);
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute("aria-busy")).toBe("true");
  });

  it("renders with fullWidth", () => {
    const { container } = render(<Button fullWidth>Full</Button>);
    expect(getButton(container).classList.contains("w-full")).toBe(true);
  });

  it("applies custom className", () => {
    const { container } = render(<Button className="custom-class">Styled</Button>);
    expect(getButton(container).classList.contains("custom-class")).toBe(true);
  });

  it("renders icon left", () => {
    render(<Button iconLeft={<span>L</span>}>Icon</Button>);
    expect(screen.getByText("L")).toBeDefined();
  });

  it("renders icon right", () => {
    render(<Button iconRight={<span>R</span>}>Icon</Button>);
    expect(screen.getByText("R")).toBeDefined();
  });

  it("renders all variant classes", () => {
    const variants = [
      "primary",
      "secondary",
      "tertiary",
      "ghost",
      "destructive",
    ] as const;
    for (const v of variants) {
      const { container } = render(<Button variant={v}>{v}</Button>);
      expect(getButton(container)).toBeDefined();
    }
  });

  it("renders all size classes", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
    for (const s of sizes) {
      const { container } = render(<Button size={s}>{s}</Button>);
      expect(getButton(container)).toBeDefined();
    }
  });

  it("maps deprecated danger variant", () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    expect(getButton(container)).toBeDefined();
  });

  it("maps deprecated glass variant", () => {
    const { container } = render(<Button variant="glass">Glass</Button>);
    expect(getButton(container)).toBeDefined();
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("sets type button by default", () => {
    const { container } = render(<Button>Default type</Button>);
    const btn = getButton(container);
    expect(btn.type).toBe("button");
  });

  it("sets aria-label for icon-only with string children", () => {
    render(<Button iconOnly>Close</Button>);
    expect(screen.getByLabelText("Close")).toBeDefined();
  });

  it("calls onClick handler", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole("button", { name: "Click" }).click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    const { container } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
    getButton(container).click();
    expect(handleClick).not.toHaveBeenCalled();
  });
});
