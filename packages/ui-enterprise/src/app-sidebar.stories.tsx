import type { Meta, StoryObj } from "@storybook/react";
import { AppSidebar } from "./app-sidebar";

const meta: Meta<typeof AppSidebar> = {
  title: "Enterprise Shell/AppSidebar",
  component: AppSidebar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

const mockItems = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "grid" },
  {
    id: "agents",
    label: "Agent Center",
    href: "/agents",
    icon: "cpu",
    children: [
      { id: "ag-overview", label: "Overview", href: "/agents/overview" },
      { id: "ag-chat", label: "Agent Workspace", href: "/agents/chat" },
    ],
  },
  { id: "missions", label: "Mission Control", href: "/missions", icon: "activity" },
  { id: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

export const Expanded: Story = {
  args: {
    items: mockItems,
    title: "Console Control",
    collapsed: false,
    activeHref: "/dashboard",
  },
};

export const Collapsed: Story = {
  args: {
    items: mockItems,
    title: "Console Control",
    collapsed: true,
    activeHref: "/dashboard",
  },
};

export const Overlay: Story = {
  args: {
    items: mockItems,
    title: "Console Control",
    mobileOpen: true,
    activeHref: "/agents/overview",
  },
};

export const Empty: Story = {
  args: {
    items: [],
    title: "Empty Workspace",
    collapsed: false,
  },
};
