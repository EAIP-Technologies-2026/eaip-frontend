import type { Meta, StoryObj } from "@storybook/react";
import { Code } from "@eaip/typography";

const meta: Meta<typeof Code> = {
  title: "Typography/Code",
  component: Code,
  argTypes: {
    variant: { control: "select", options: ["inline", "block"] },
    color: { control: "select", options: ["default", "primary"] },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Code>;

export const Inline: Story = {
  args: {
    variant: "inline",
    children: "const x = 42;",
  },
};

export const Block: Story = {
  args: {
    variant: "block",
    children: `function greet(name: string): void {
  console.log("Hello, " + name);
}`,
  },
};

export const PrimaryInline: Story = {
  args: {
    variant: "inline",
    color: "primary",
    children: "useEffect()",
  },
};

export const InContext: Story = {
  render: () => (
    <p className="text-text">
      To log a value, use <Code color="primary">console.log()</Code> in your
      JavaScript code.
    </p>
  ),
};
