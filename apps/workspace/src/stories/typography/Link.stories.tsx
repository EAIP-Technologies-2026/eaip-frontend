import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "@eaip/typography";

const meta: Meta<typeof Link> = {
  title: "Typography/Link",
  component: Link,
  argTypes: {
    variant: { control: "select", options: ["default", "subtle", "muted"] },
    underline: { control: "boolean" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Click here",
  },
};

export const Subtle: Story = {
  args: {
    variant: "subtle",
    href: "#",
    children: "Subtle link",
  },
};

export const Underlined: Story = {
  args: {
    underline: true,
    href: "#",
    children: "Underlined link",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Link href="#">Default link</Link>
      <Link href="#" variant="subtle">Subtle link</Link>
      <Link href="#" variant="muted">Muted link</Link>
      <Link href="#" underline>Underlined link</Link>
    </div>
  ),
};
