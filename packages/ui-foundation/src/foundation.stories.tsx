import { useState } from "react";
import { Dialog } from "./dialog";
import { Drawer } from "./drawer";
import type { NotificationItem } from "./notification-framework";
import { NotificationEngine } from "./notification-framework";
import { ContextMenu } from "./context-menu";
import { NavigationGroups } from "./nav-foundation";
import { CommandPaletteShell } from "./command-palette-shell";
import { MetricCard, InfoCard } from "./data-cards";
import { DataTable } from "./data-table";

export default {
  title: "Foundation/OverlaysAndNavigation",
};

export const CompoundDialogStory = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4">
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="bg-primary rounded px-4 py-2 text-white"
      >
        Open Dialog
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Content>
          <div className="flex items-center justify-between">
            <Dialog.Title>System Confirmation</Dialog.Title>
            <Dialog.Close />
          </div>
          <Dialog.Description>
            Are you sure you want to proceed with this configuration update?
          </Dialog.Description>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};

export const DrawerStory = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-4">
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="bg-secondary rounded px-4 py-2"
      >
        Open Drawer
      </button>
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title="Navigation Drawer"
      >
        <p className="text-sm">Drawer content area.</p>
      </Drawer>
    </div>
  );
};

export const NotificationFrameworkStory = () => {
  const notifications: NotificationItem[] = [
    {
      id: "1",
      type: "toast",
      variant: "success",
      title: "Changes Saved",
      description: "Your profile has been updated.",
    },
    {
      id: "2",
      type: "inline",
      variant: "warning",
      title: "Storage Alert",
      description: "85% of assigned quota used.",
    },
  ];
  return (
    <div className="space-y-4 p-4">
      <NotificationEngine notifications={notifications} />
    </div>
  );
};

export const ContextMenuStory = () => (
  <div className="flex justify-center p-12">
    <ContextMenu>
      <ContextMenu.Trigger>
        <div className="rounded-card border border-dashed p-8 text-sm">
          Right click inside this area
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item icon="edit">Edit Item</ContextMenu.Item>
        <ContextMenu.Item icon="copy">Duplicate</ContextMenu.Item>
        <ContextMenu.Item icon="trash" danger>
          Delete Item
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  </div>
);

export const NavigationGroupsStory = () => {
  const groups = [
    {
      id: "g1",
      title: "Core Platform",
      items: [
        { id: "n1", label: "Dashboard", icon: "grid", active: true },
        { id: "n2", label: "Analytics", icon: "activity" },
      ],
    },
  ];
  return (
    <div className="max-w-xs p-4">
      <NavigationGroups groups={groups} />
    </div>
  );
};

export const CommandPaletteStory = () => {
  const [open, setOpen] = useState(false);
  const items = [
    { id: "cmd1", label: "Open Settings", category: "Navigation", shortcut: "⌘S" },
    { id: "cmd2", label: "Create Workspace", category: "Action", shortcut: "⌘N" },
  ];
  return (
    <div className="p-4">
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="rounded border px-4 py-2 text-sm"
      >
        Toggle Command Palette
      </button>
      <CommandPaletteShell
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        items={items}
      />
    </div>
  );
};

export const DataCardsAndTables = () => {
  const columns = [
    { id: "name", header: "Name", accessorKey: "name" as const },
    { id: "role", header: "Role", accessorKey: "role" as const },
  ];
  const data = [
    { id: "1", name: "Alice Vance", role: "Administrator" },
    { id: "2", name: "Marcus Aurelius", role: "Lead Engineer" },
  ];
  return (
    <div className="max-w-2xl space-y-6 p-4">
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title="Total Active Users"
          value="12,450"
          change="+14%"
          trend="up"
          icon="users"
        />
        <InfoCard
          title="Infrastructure Ready"
          description="All nodes operating at sub-10ms latency."
          icon="cpu"
        />
      </div>
      <DataTable columns={columns} data={data} selectable />
    </div>
  );
};
