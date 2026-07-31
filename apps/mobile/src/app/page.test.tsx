import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

vi.mock("@eaip/auth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    loading: false,
    user: { id: "1", name: "Test" },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Home page", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByText("Redirecting...")).toBeTruthy();
  });
});
