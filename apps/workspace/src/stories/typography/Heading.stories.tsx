import type { Meta, StoryObj } from "@storybook/react";
import { Heading } from "@eaip/typography";

const meta: Meta<typeof Heading> = {
  title: "Typography/Heading",
  component: Heading,
  argTypes: {
    level: { control: { type: "number", min: 1, max: 6 } },
    size: { control: "select", options: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"] },
    weight: { control: "select", options: ["medium", "semibold", "bold"] },
    color: { control: "select", options: ["default", "secondary", "muted", "inverse", "primary"] },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const H1: Story = {
  args: {
    level: 1,
    children: "Heading 1",
  },
};

export const H2: Story = {
  args: {
    level: 2,
    children: "Heading 2",
  },
};

export const H3: Story = {
  args: {
    level: 3,
    children: "Heading 3",
  },
};

export const H4: Story = {
  args: {
    level: 4,
    children: "Heading 4",
  },
};

export const H5: Story = {
  args: {
    level: 5,
    children: "Heading 5",
  },
};

export const H6: Story = {
  args: {
    level: 6,
    children: "Heading 6",
  },
};

export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Heading level={1}>Heading 1</Heading>
      <Heading level={2}>Heading 2</Heading>
      <Heading level={3}>Heading 3</Heading>
      <Heading level={4}>Heading 4</Heading>
      <Heading level={5}>Heading 5</Heading>
      <Heading level={6}>Heading 6</Heading>
    </div>
  ),
};

export const PrimaryColor: Story = {
  args: {
    level: 2,
    color: "primary",
    children: "Primary Heading",
  },
};
