import type { Meta, StoryObj } from "@storybook/react";
import { AppHeader } from "./app-header";

const meta: Meta<typeof AppHeader> = {
  title: "Enterprise Shell/AppHeader",
  component: AppHeader,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {
  args: {
    appTitle: "Enterprise Autonomous Intelligence Platform",
    appId: "console",
    sidebarOpen: true,
    workspaces: [
      { id: "ws-1", name: "Production Alpha", slug: "prod-alpha" },
      { id: "ws-2", name: "Staging Sandbox", slug: "staging" },
    ],
    activeWorkspace: { id: "ws-1", name: "Production Alpha", slug: "prod-alpha" },
    breadcrumbs: [
      { label: "Console", href: "/console" },
      { label: "Settings", href: "/console/settings" },
    ],
    user: {
      name: "Alex Vance",
      email: "alex.vance@eaip.internal",
      role: "Lead Platform Engineer",
    },
    pageTitle: "System Configuration",
  },
};

export const Compact: Story = {
  args: {
    appTitle: "EAIP Console",
    appId: "console",
    sidebarOpen: false,
    user: {
      name: "Jane Doe",
      email: "jane@eaip.internal",
    },
  },
};
