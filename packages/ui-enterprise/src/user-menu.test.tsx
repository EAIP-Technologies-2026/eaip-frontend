import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserMenu } from "./user-menu";

const mockUser = {
  name: "Marcus Aurelius",
  email: "marcus@eaip.internal",
  role: "Administrator",
};

describe("UserMenu Component", () => {
  it("renders user avatar and toggle button", () => {
    render(<UserMenu user={mockUser} />);
    const button = screen.getByRole("button", { name: /marcus aurelius profile menu/i });
    expect(button).toBeInTheDocument();
  });

  it("opens menu dropdown and shows user details and items", () => {
    const handleSignOut = vi.fn();
    render(<UserMenu user={mockUser} onSignOut={handleSignOut} />);

    const button = screen.getByRole("button", { name: /marcus aurelius profile menu/i });
    fireEvent.click(button);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("marcus@eaip.internal")).toBeInTheDocument();

    const signOutBtn = screen.getByRole("menuitem", { name: /sign out/i });
    fireEvent.click(signOutBtn);
    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });
});
