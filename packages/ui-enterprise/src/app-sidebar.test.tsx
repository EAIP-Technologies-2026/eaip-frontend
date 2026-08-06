import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSidebar } from "./app-sidebar";

const mockItems = [
  { id: "dash", label: "Dashboard", href: "/dashboard", icon: "grid" },
  { id: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

describe("AppSidebar Component", () => {
  it("renders sidebar landmark and navigation items", () => {
    render(<AppSidebar items={mockItems} activeHref="/dashboard" />);
    expect(screen.getByRole("complementary", { name: "Sidebar Navigation" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Main Navigation" })).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("sets aria-current='page' on active navigation item", () => {
    render(<AppSidebar items={mockItems} activeHref="/dashboard" />);
    const activeLink = screen.getByText("Dashboard").closest("a");
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });

  it("handles item navigation click callback", () => {
    const handleNavigate = vi.fn();
    render(<AppSidebar items={mockItems} onNavigate={handleNavigate} />);
    fireEvent.click(screen.getByText("Settings"));
    expect(handleNavigate).toHaveBeenCalledWith("/settings");
  });

  it("closes mobile overlay on Escape key press", () => {
    const handleMobileClose = vi.fn();
    render(<AppSidebar items={mockItems} mobileOpen={true} onMobileClose={handleMobileClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleMobileClose).toHaveBeenCalledTimes(1);
  });
});
