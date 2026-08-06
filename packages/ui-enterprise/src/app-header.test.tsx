import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppHeader } from "./app-header";

describe("AppHeader Component", () => {
  it("renders app title and banner landmark correctly", () => {
    render(<AppHeader appTitle="EAIP Console" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("EAIP Console")).toBeInTheDocument();
  });

  it("handles sidebar toggle button click", () => {
    const handleToggle = vi.fn();
    render(<AppHeader onSidebarToggle={handleToggle} sidebarOpen={true} />);
    const toggleButton = screen.getByRole("button", { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("renders skip-to-content accessibility link", () => {
    render(<AppHeader />);
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("renders user menu when user object is provided", () => {
    render(<AppHeader user={{ name: "Test User", email: "test@eaip.internal" }} />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});
