import type { Meta, StoryObj } from "@storybook/react";
import { Flex } from "@eaip/ui-primitives";

const meta: Meta<typeof Flex> = {
  title: "UI-Primitives/Layout/Flex",
  component: Flex,
  argTypes: {
    direction: { control: "select", options: ["row", "column", "row-reverse", "column-reverse"] },
    align: { control: "select", options: ["start", "end", "center", "baseline", "stretch"] },
    justify: { control: "select", options: ["start", "end", "center", "between", "around", "evenly"] },
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
    wrap: { control: "select", options: ["nowrap", "wrap", "wrap-reverse"] },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Flex>;

export const Row: Story = {
  args: {
    direction: "row",
    gap: "md",
    children: (
      <>
        <div className="rounded bg-primary-subtle p-4 text-primary">Item 1</div>
        <div className="rounded bg-primary-subtle p-4 text-primary">Item 2</div>
        <div className="rounded bg-primary-subtle p-4 text-primary">Item 3</div>
      </>
    ),
  },
};

export const Column: Story = {
  args: {
    direction: "column",
    gap: "md",
    children: (
      <>
        <div className="rounded bg-primary-subtle p-4 text-primary">Item 1</div>
        <div className="rounded bg-primary-subtle p-4 text-primary">Item 2</div>
        <div className="rounded bg-primary-subtle p-4 text-primary">Item 3</div>
      </>
    ),
  },
};

export const Centered: Story = {
  args: {
    align: "center",
    justify: "center",
    gap: "md",
    style: { height: "200px", border: "1px dashed var(--color-border)" },
    children: (
      <>
        <div className="rounded bg-primary-subtle p-4 text-primary">Centered</div>
      </>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    justify: "between",
    gap: "md",
    children: (
      <>
        <div className="rounded bg-primary-subtle p-4 text-primary">Left</div>
        <div className="rounded bg-primary-subtle p-4 text-primary">Center</div>
        <div className="rounded bg-primary-subtle p-4 text-primary">Right</div>
      </>
    ),
  },
};
