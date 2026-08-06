import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkspaceSwitcher } from "./workspace-switcher";

const mockWorkspaces = [
  { id: "ws-1", name: "Primary Hub", slug: "primary" },
  { id: "ws-2", name: "Secondary Core", slug: "secondary" },
];

describe("WorkspaceSwitcher Component", () => {
  it("renders button with current active workspace name", () => {
    render(<WorkspaceSwitcher workspaces={mockWorkspaces} activeWorkspace={mockWorkspaces[0]} />);
    expect(screen.getByRole("button", { name: /select workspace/i })).toHaveTextContent(
      "Primary Hub",
    );
  });

  it("opens listbox dropdown and allows keyboard selection", () => {
    const handleWorkspaceChange = vi.fn();
    render(
      <WorkspaceSwitcher
        workspaces={mockWorkspaces}
        activeWorkspace={mockWorkspaces[0]}
        onWorkspaceChange={handleWorkspaceChange}
      />,
    );

    const button = screen.getByRole("button", { name: /select workspace/i });
    fireEvent.click(button);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();

    // Navigate down and select second item
    fireEvent.keyDown(button, { key: "ArrowDown" });
    fireEvent.keyDown(button, { key: "Enter" });

    expect(handleWorkspaceChange).toHaveBeenCalledWith(mockWorkspaces[1]);
  });
});
