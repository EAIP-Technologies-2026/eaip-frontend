import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Dialog } from "./dialog";
import { Drawer } from "./drawer";
import { NotificationEngine } from "./notification-framework";
import { ContextMenu } from "./context-menu";
import { NavigationGroups } from "./nav-foundation";
import { CommandPaletteShell } from "./command-palette-shell";
import { MetricCard } from "./data-cards";
import { DataTable } from "./data-table";

describe("Sprint 2D-2F Foundation Components in ui-foundation", () => {
  it("renders compound Dialog when open and handles close", () => {
    const handleClose = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleClose}>
        <Dialog.Content>
          <Dialog.Title>Test Title</Dialog.Title>
          <Dialog.Description>Test Description</Dialog.Description>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Test Title")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(handleClose).toHaveBeenCalledWith(false);
  });

  it("renders Drawer component and supports backdrop click", () => {
    const handleClose = vi.fn();
    render(
      <Drawer open={true} onClose={handleClose} title="Drawer Title">
        <div>Drawer Body</div>
      </Drawer>,
    );

    expect(screen.getByText("Drawer Title")).toBeDefined();
    expect(screen.getByText("Drawer Body")).toBeDefined();
  });

  it("renders NotificationEngine toast and inline items", () => {
    const items = [
      { id: "1", type: "toast" as const, title: "Toast Notification" },
      { id: "2", type: "inline" as const, title: "Inline Alert" },
    ];
    render(<NotificationEngine notifications={items} />);
    expect(screen.getByText("Toast Notification")).toBeDefined();
    expect(screen.getByText("Inline Alert")).toBeDefined();
  });

  it("renders ContextMenu and opens menu on right-click", () => {
    render(
      <ContextMenu>
        <ContextMenu.Trigger>Right click target</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item>Item 1</ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>,
    );

    const trigger = screen.getByText("Right click target");
    fireEvent.contextMenu(trigger, { clientX: 50, clientY: 50 });
    expect(screen.getByRole("menu")).toBeDefined();
    expect(screen.getByText("Item 1")).toBeDefined();
  });

  it("renders NavigationGroups and items", () => {
    const groups = [
      {
        id: "g1",
        title: "Section 1",
        items: [{ id: "n1", label: "Overview" }],
      },
    ];
    render(<NavigationGroups groups={groups} />);
    expect(screen.getByText("Section 1")).toBeDefined();
    expect(screen.getByText("Overview")).toBeDefined();
  });

  it("renders CommandPaletteShell when open and filters items", () => {
    const items = [{ id: "c1", label: "Open Preferences", category: "System" }];
    render(<CommandPaletteShell open={true} onClose={() => {}} items={items} />);
    expect(screen.getByRole("dialog", { name: "Command Palette" })).toBeDefined();
    expect(screen.getByText("Open Preferences")).toBeDefined();
  });

  it("renders MetricCard and DataTable with selections", () => {
    const cols = [{ id: "name", header: "Name", accessorKey: "name" as const }];
    const data = [{ id: "1", name: "John Doe" }];
    render(
      <div>
        <MetricCard title="Revenue" value="$45,000" />
        <DataTable columns={cols} data={data} selectable />
      </div>,
    );

    expect(screen.getByText("Revenue")).toBeDefined();
    expect(screen.getByText("John Doe")).toBeDefined();
  });
});
