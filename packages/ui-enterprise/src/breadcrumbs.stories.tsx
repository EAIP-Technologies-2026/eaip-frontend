import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Enterprise Shell/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const ShortPath: Story = {
  args: {
    items: [{ label: "Console", href: "/console" }, { label: "Dashboard" }],
  },
};

export const DeepPath: Story = {
  args: {
    items: [
      { label: "Console", href: "/console" },
      { label: "Agent Center", href: "/console/agents" },
      { label: "Autonomous Agent Alpha", href: "/console/agents/ag-001" },
      { label: "Model Configuration" },
    ],
  },
};
