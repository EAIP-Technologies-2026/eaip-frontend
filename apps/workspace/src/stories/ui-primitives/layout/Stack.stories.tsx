import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "@eaip/ui-primitives";

const meta: Meta<typeof Stack> = {
  title: "UI-Primitives/Layout/Stack",
  component: Stack,
  argTypes: {
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
    dividers: { control: "boolean" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: {
    gap: "md",
    children: (
      <>
        <div className="rounded bg-surface-secondary p-4">Item 1</div>
        <div className="rounded bg-surface-secondary p-4">Item 2</div>
        <div className="rounded bg-surface-secondary p-4">Item 3</div>
      </>
    ),
  },
};

export const WithDividers: Story = {
  args: {
    gap: "md",
    dividers: true,
    children: (
      <>
        <div className="py-4">Section 1</div>
        <div className="py-4">Section 2</div>
        <div className="py-4">Section 3</div>
      </>
    ),
  },
};

export const Tight: Story = {
  args: {
    gap: "xs",
    children: (
      <>
        <div className="rounded bg-surface-secondary p-2">Item 1</div>
        <div className="rounded bg-surface-secondary p-2">Item 2</div>
        <div className="rounded bg-surface-secondary p-2">Item 3</div>
      </>
    ),
  },
};
