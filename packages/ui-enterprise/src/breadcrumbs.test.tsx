import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Breadcrumbs } from "./breadcrumbs";

describe("Breadcrumbs Component", () => {
  it("renders breadcrumb navigation landmark and items", () => {
    const items = [{ label: "Home", href: "/home" }, { label: "Settings" }];
    render(<Breadcrumbs items={items} />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("sets aria-current='page' on current (last) breadcrumb item", () => {
    const items = [{ label: "Home", href: "/home" }, { label: "Dashboard" }];
    render(<Breadcrumbs items={items} />);

    const lastItem = screen.getByText("Dashboard");
    expect(lastItem).toHaveAttribute("aria-current", "page");
  });

  it("handles navigation click callback on non-last breadcrumb item", () => {
    const handleNavigate = vi.fn();
    const items = [{ label: "Home", href: "/home" }, { label: "Dashboard" }];
    render(<Breadcrumbs items={items} onNavigate={handleNavigate} />);

    fireEvent.click(screen.getByText("Home"));
    expect(handleNavigate).toHaveBeenCalledWith("/home");
  });
});
