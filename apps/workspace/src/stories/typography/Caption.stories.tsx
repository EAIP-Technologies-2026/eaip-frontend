import type { Meta, StoryObj } from "@storybook/react";
import { Caption } from "@eaip/typography";

const meta: Meta<typeof Caption> = {
  title: "Typography/Caption",
  component: Caption,
  argTypes: {
    color: { control: "select", options: ["default", "secondary", "muted"] },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Caption>;

export const Default: Story = {
  args: {
    children: "This is a caption text",
  },
};

export const Muted: Story = {
  args: {
    color: "muted",
    children: "This is a muted caption",
  },
};

export const WithText: Story = {
  render: () => (
    <div>
      <p className="text-text">Main content text</p>
      <Caption>Supporting caption text below</Caption>
    </div>
  ),
};
