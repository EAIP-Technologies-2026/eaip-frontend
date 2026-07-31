import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@eaip/typography";

const meta: Meta<typeof Label> = {
  title: "Typography/Label",
  component: Label,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    required: { control: "boolean" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Username",
  },
};

export const Required: Story = {
  args: {
    children: "Email Address",
    required: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Label size="sm">Small label</Label>
      <Label size="md">Medium label (default)</Label>
      <Label size="lg">Large label</Label>
    </div>
  ),
};
