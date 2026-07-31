import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@eaip/typography";

const meta: Meta<typeof Text> = {
  title: "Typography/Text",
  component: Text,
  argTypes: {
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "2xl"] },
    weight: { control: "select", options: ["normal", "medium", "semibold", "bold"] },
    color: { control: "select", options: ["default", "secondary", "muted", "inverse", "primary", "success", "warning", "danger"] },
    align: { control: "select", options: ["left", "center", "right", "justify"] },
    truncate: { control: "boolean" },
    lineClamp: { control: { type: "number", min: 1, max: 6 } },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "The quick brown fox jumps over the lazy dog.",
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text size="xs">XS: Extra small text</Text>
      <Text size="sm">SM: Small text</Text>
      <Text size="md">MD: Medium text (default)</Text>
      <Text size="lg">LG: Large text</Text>
      <Text size="xl">XL: Extra large text</Text>
      <Text size="2xl">2XL: Double extra large text</Text>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text weight="normal">Normal weight</Text>
      <Text weight="medium">Medium weight</Text>
      <Text weight="semibold">Semibold weight</Text>
      <Text weight="bold">Bold weight</Text>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Text color="default">Default color</Text>
      <Text color="secondary">Secondary color</Text>
      <Text color="muted">Muted color</Text>
      <Text color="primary">Primary color</Text>
      <Text color="success">Success color</Text>
      <Text color="warning">Warning color</Text>
      <Text color="danger">Danger color</Text>
    </div>
  ),
};

export const Truncated: Story = {
  args: {
    truncate: true,
    style: { maxWidth: "200px" },
    children: "This is a very long text that should be truncated with ellipsis when it exceeds the container width.",
  },
};

export const LineClamped: Story = {
  args: {
    lineClamp: 3,
    style: { maxWidth: "300px" },
    children:
      "This is a long text that will be clamped to three lines. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
};
