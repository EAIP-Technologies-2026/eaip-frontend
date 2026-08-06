import type { Meta, StoryObj } from "@storybook/react";
import { WorkspaceSwitcher } from "./workspace-switcher";

const meta: Meta<typeof WorkspaceSwitcher> = {
  title: "Enterprise Shell/WorkspaceSwitcher",
  component: WorkspaceSwitcher,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WorkspaceSwitcher>;

const mockWorkspaces = [
  { id: "ws-1", name: "Global Operations Hub", slug: "global-hub" },
  { id: "ws-2", name: "EMEA Regional Core", slug: "emea-core" },
  { id: "ws-3", name: "APAC Intelligence Grid", slug: "apac-grid" },
];

export const SingleWorkspace: Story = {
  args: {
    workspaces: [{ id: "ws-1", name: "Global Operations Hub", slug: "global-hub" }],
    activeWorkspace: { id: "ws-1", name: "Global Operations Hub", slug: "global-hub" },
  },
};

export const MultipleWorkspaces: Story = {
  args: {
    workspaces: mockWorkspaces,
    activeWorkspace: mockWorkspaces[0],
  },
};
