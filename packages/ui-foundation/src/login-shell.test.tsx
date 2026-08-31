import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LoginShell } from "./login-shell";

describe("LoginShell — Ring Login & Cinematic Loading Integration", () => {
  it("renders login form with branding, fields, and 3 organic ring layers", () => {
    const handleSubmit = vi.fn();
    const { container } = render(
      <LoginShell
        appName="Enterprise Console"
        appSubtitle="Enterprise Intelligence Platform"
        onSubmit={handleSubmit}
      />,
    );

    expect(screen.getByText("Sign in to your workspace")).toBeDefined();
    expect(screen.getByPlaceholderText("name@company.com")).toBeDefined();
    expect(screen.getByPlaceholderText("Enter your password")).toBeDefined();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeDefined();

    // Verify 3 ring layers exist
    const ringContainer = container.querySelector(".eaip-ring-container");
    expect(ringContainer).not.toBeNull();
    expect(container.querySelector(".eaip-ring-layer--1")).not.toBeNull();
    expect(container.querySelector(".eaip-ring-layer--2")).not.toBeNull();
    expect(container.querySelector(".eaip-ring-layer--3")).not.toBeNull();
  });

  it("submits email and password on form submission", () => {
    const handleSubmit = vi.fn();
    render(<LoginShell appName="Enterprise Console" onSubmit={handleSubmit} />);

    const emailInput = screen.getByPlaceholderText("name@company.com");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    fireEvent.change(emailInput, { target: { value: "admin@eaip.local" } });
    fireEvent.change(passwordInput, { target: { value: "AdminPass123!" } });

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(handleSubmit).toHaveBeenCalledWith("admin@eaip.local", "AdminPass123!", undefined);
  });

  it("displays error message when error prop is provided", () => {
    render(
      <LoginShell
        appName="Enterprise Console"
        onSubmit={() => {}}
        error="Invalid enterprise credentials"
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(alert.textContent).toContain("Invalid enterprise credentials");
  });

  it("does not render authentication loading overlay when loading is false", () => {
    const { container } = render(
      <LoginShell appName="Enterprise Console" onSubmit={() => {}} loading={false} />,
    );

    expect(container.querySelector(".loader--fullscreen")).toBeNull();
  });

  it("renders accessible cinematic gooey loader overlay when loading is true", () => {
    const { container } = render(
      <LoginShell appName="Enterprise Console" onSubmit={() => {}} loading={true} />,
    );

    const overlay = container.querySelector(".loader--fullscreen");
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("role")).toBe("status");
    expect(overlay?.getAttribute("aria-live")).toBe("polite");
    expect(overlay?.getAttribute("aria-busy")).toBe("true");

    expect(screen.getByText("Signing in to EAIP")).toBeDefined();
    expect(screen.getByText("Establishing secure enterprise session...")).toBeDefined();

    // Verify gooey animation elements and SVG filter
    expect(container.querySelector(".loader__balls")).not.toBeNull();
    expect(container.querySelector(".eaip-gooey-dot--1")).not.toBeNull();
    expect(container.querySelector(".eaip-gooey-dot--2")).not.toBeNull();
    expect(container.querySelector("#gooey")).not.toBeNull();
  });
});
