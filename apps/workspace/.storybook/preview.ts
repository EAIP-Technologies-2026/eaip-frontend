import type { Preview, Decorator } from "@storybook/react";
import "../src/app/globals.css";
import { ThemeProvider } from "@eaip/theme";

const themeDecorator: Decorator = (Story) => (
  <ThemeProvider defaultMode="light" defaultVariant="enterprise-light">
    <Story />
  </ThemeProvider>
);

const preview: Preview = {
  decorators: [themeDecorator],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      element: "body",
      config: {
        rules: [],
      },
    },
  },
};

export default preview;
