import type { Meta, StoryObj } from "@storybook/react";
import { UserMenu } from "./user-menu";

const meta: Meta<typeof UserMenu> = {
  title: "Enterprise Shell/UserMenu",
  component: UserMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Closed: Story = {
  args: {
    user: {
      name: "Marcus Aurelius",
      email: "marcus@eaip.internal",
      role: "Platform Operations Director",
    },
    menuItems: [
      { id: "profile", label: "My Profile", icon: "user" },
      { id: "settings", label: "Preferences", icon: "settings" },
    ],
  },
};

export const Open: Story = {
  args: {
    user: {
      name: "Marcus Aurelius",
      email: "marcus@eaip.internal",
      role: "Platform Operations Director",
    },
    menuItems: [
      { id: "profile", label: "My Profile", icon: "user" },
      { id: "settings", label: "Preferences", icon: "settings" },
    ],
  },
};
