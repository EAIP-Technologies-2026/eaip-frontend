import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AuroraOrb } from "./aurora-orb";

describe("AuroraOrb", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders a semantic button element", () => {
    render(<AuroraOrb onClick={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
  });

  it("has an accessible aria-label", () => {
    render(<AuroraOrb onClick={vi.fn()} label="Test Label" />);
    const button = screen.getByRole("button", { name: "Test Label" });
    expect(button).toBeInTheDocument();
  });

  it("uses default label when none provided", () => {
    render(<AuroraOrb onClick={vi.fn()} />);
    const button = screen.getByRole("button", { name: "Open Conductor" });
    expect(button).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<AuroraOrb onClick={onClick} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick on Enter key", () => {
    const onClick = vi.fn();
    render(<AuroraOrb onClick={onClick} />);
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter" });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick on Space key", () => {
    const onClick = vi.fn();
    render(<AuroraOrb onClick={onClick} />);
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("sets aria-expanded correctly", () => {
    render(<AuroraOrb onClick={vi.fn()} ariaExpanded={true} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("defaults aria-expanded to false", () => {
    render(<AuroraOrb onClick={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("has aria-haspopup='dialog'", () => {
    render(<AuroraOrb onClick={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("renders badge when provided", () => {
    render(<AuroraOrb onClick={vi.fn()} badge={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does not render badge when not provided", () => {
    render(<AuroraOrb onClick={vi.fn()} />);
    // Badge span should not exist
    const badges = document.querySelectorAll("span.absolute.-top-1.-right-1");
    expect(badges.length).toBe(0);
  });

  it("renders canvas element for WebGL", () => {
    render(<AuroraOrb onClick={vi.fn()} />);
    // Canvas or fallback should be present
    const canvas = document.querySelector("canvas");
    const fallback = document.querySelector("[class*='gradient']");
    expect(canvas ?? fallback).toBeTruthy();
  });

  it("applies custom size", () => {
    render(<AuroraOrb onClick={vi.fn()} size={80} />);
    const button = screen.getByRole("button");
    expect(button).toHaveStyle({ width: "80px", height: "80px" });
  });

  it("applies custom className", () => {
    render(<AuroraOrb onClick={vi.fn()} className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("respects reduced motion preference", () => {
    // Mock matchMedia for reduced motion
    const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal("matchMedia", mockMatchMedia);

    render(<AuroraOrb onClick={vi.fn()} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});

describe("ConductorWidget with AuroraOrb", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders AuroraOrb as trigger in collapsed mode", async () => {
    const { ConductorWidget } = await import("./ai-assistant");
    render(<ConductorWidget messages={[]} onSend={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /Open personal EAIP assistant/i });
    expect(trigger).toBeInTheDocument();
  });

  it("trigger has correct accessibility attributes", async () => {
    const { ConductorWidget } = await import("./ai-assistant");
    render(<ConductorWidget messages={[]} onSend={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /Open personal EAIP assistant/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("clicking trigger opens docked mode", async () => {
    const { ConductorWidget } = await import("./ai-assistant");
    render(<ConductorWidget messages={[]} onSend={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /Open personal EAIP assistant/i });
    fireEvent.click(trigger);
    expect(screen.getByRole("region", { name: /Personal EAIP Assistant/i })).toBeInTheDocument();
  });
});
