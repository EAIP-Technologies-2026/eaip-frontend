import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "@eaip/ui-primitives";

const meta: Meta<typeof Container> = {
  title: "UI-Primitives/Layout/Container",
  component: Container,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    padding: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: (
      <div className="rounded bg-surface-secondary p-8 text-center text-text-secondary">
        This content is contained within a max-width container
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: (
      <div className="rounded bg-surface-secondary p-8 text-center text-text-secondary">
        Small container (max-w-3xl)
      </div>
    ),
  },
};

export const Full: Story = {
  args: {
    size: "full",
    children: (
      <div className="rounded bg-surface-secondary p-8 text-center text-text-secondary">
        Full width container
      </div>
    ),
  },
};
