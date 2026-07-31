import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from "@eaip/ui-primitives";

const meta: Meta<typeof Grid> = {
  title: "UI-Primitives/Layout/Grid",
  component: Grid,
  argTypes: {
    columns: { control: { type: "number", min: 1, max: 12 } },
    gap: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Grid>;

const itemClass = "rounded bg-primary-subtle p-4 text-primary text-center";

export const ThreeColumns: Story = {
  args: {
    columns: 3,
    gap: "md",
    children: (
      <>
        <div className={itemClass}>1</div>
        <div className={itemClass}>2</div>
        <div className={itemClass}>3</div>
        <div className={itemClass}>4</div>
        <div className={itemClass}>5</div>
        <div className={itemClass}>6</div>
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    columns: 2,
    gap: "lg",
    children: (
      <>
        <div className={itemClass}>Left</div>
        <div className={itemClass}>Right</div>
      </>
    ),
  },
};

export const AutoColumns: Story = {
  args: {
    columns: "auto",
    gap: "md",
    children: (
      <>
        <div className={itemClass}>Auto 1</div>
        <div className={itemClass}>Auto 2</div>
        <div className={itemClass}>Auto 3</div>
      </>
    ),
  },
};
