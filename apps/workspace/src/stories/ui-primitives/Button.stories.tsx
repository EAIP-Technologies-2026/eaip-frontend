import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@eaip/ui-primitives";

const meta: Meta<typeof Button> = {
  title: "UI-Primitives/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary", "ghost", "destructive"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    loading: { control: "boolean" },
    success: { control: "boolean" },
    error: { control: "boolean" },
    fullWidth: { control: "boolean" },
    iconOnly: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
    children: "Tertiary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const XS: Story = {
  args: {
    size: "xs",
    children: "XS",
  },
};

export const SM: Story = {
  args: {
    size: "sm",
    children: "SM",
  },
};

export const MD: Story = {
  args: {
    size: "md",
    children: "MD",
  },
};

export const LG: Story = {
  args: {
    size: "lg",
    children: "LG",
  },
};

export const XL: Story = {
  args: {
    size: "xl",
    children: "XL",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading",
  },
};

export const Success: Story = {
  args: {
    success: true,
    children: "Saved",
  },
};

export const Error: Story = {
  args: {
    error: true,
    children: "Failed",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: "Full Width",
  },
};

export const WithIconLeft: Story = {
  args: {
    iconLeft: <span>&larr;</span>,
    children: "Back",
  },
};

export const WithIconRight: Story = {
  args: {
    iconRight: <span>&rarr;</span>,
    children: "Next",
  },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    children: "Menu",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button loading>Loading</Button>
      <Button success>Success</Button>
      <Button error>Error</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};
