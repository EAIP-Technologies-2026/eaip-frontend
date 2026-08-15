import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import BrainsPage from "./page";
import { ThemeProvider } from "@eaip/theme";

const push = vi.fn();
const createBrain = vi.fn<(body: Record<string, unknown>) => Promise<{ id: string }>>();

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

vi.mock("@eaip/auth", () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({ user: { id: "test-user", name: "Test User" }, logout: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("../../services/brains-service", () => ({
  fetchBrains: vi.fn().mockResolvedValue([]),
  fetchBrainTemplates: vi.fn().mockResolvedValue([
    {
      id: "marketing",
      name: "Marketing Brain",
      description: "Qualified acquisition intelligence.",
      businessFunction: "Marketing",
      objectives: ["Improve qualified customer acquisition."],
      instructions: "Use evidence.",
      rules: ["Require approval."],
      tools: ["knowledge.search"],
    },
  ]),
  createBrain: (body: Record<string, unknown>) => createBrain(body),
}));

describe("Second Brain creation", () => {
  it("creates a Marketing Brain and opens its command center", async () => {
    createBrain.mockResolvedValue({ id: "brain-marketing-1" });
    render(
      <ThemeProvider defaultMode="light" defaultVariant="enterprise-light">
        <BrainsPage />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Create Marketing Brain")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: "Create a Brain" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: /^Create Brain$/ }));

    await waitFor(() => {
      expect(createBrain).toHaveBeenCalled();
    });
    const request = createBrain.mock.calls[0]?.[0];
    expect(request).toMatchObject({
      template: "marketing",
      name: "Marketing Brain",
      objectives: ["Improve qualified customer acquisition."],
    });
    expect(push).toHaveBeenCalledWith("/brains/brain-marketing-1");
  });
});
