import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@eaip/ui-primitives";

const meta: Meta<typeof Box> = {
  title: "UI-Primitives/Layout/Box",
  component: Box,
  argTypes: {
    as: { control: "text" },
    padding: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
    margin: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
  args: {
    children: "This is a Box component",
    padding: "md",
  },
};

export const WithCustomTag: Story = {
  args: {
    as: "article",
    padding: "lg",
    children: "I'm an <article> element",
  },
};

export const WithMargin: Story = {
  args: {
    margin: "xl",
    padding: "md",
    children: "I have margin and padding",
  },
};
