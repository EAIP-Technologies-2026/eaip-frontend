import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider, useTheme, themes, THEME_VARIANTS } from "@eaip/theme";

const DemoContent = () => {
  const theme = useTheme();
  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Inter, system-ui, sans-serif",
        background: "var(--color-surface-secondary)",
        color: "var(--color-text)",
        minHeight: "300px",
        borderRadius: "var(--radius-card)",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", color: "var(--color-text)" }}>
        {themes[theme.variant].name}
      </h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
        Mode: <strong>{theme.mode}</strong> &middot; Resolved: <strong>{theme.resolved}</strong> &middot; Variant: <strong>{theme.variant}</strong> &middot; Reduced motion: <strong>{String(theme.reducedMotion)}</strong>
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => { theme.setMode("light"); }}
          style={{
            background: theme.mode === "light" ? "var(--color-primary)" : "var(--color-surface)",
            color: theme.mode === "light" ? "var(--color-text-inverse)" : "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-button)",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => { theme.setMode("dark"); }}
          style={{
            background: theme.mode === "dark" ? "var(--color-primary)" : "var(--color-surface)",
            color: theme.mode === "dark" ? "var(--color-text-inverse)" : "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-button)",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => { theme.setMode("vibe"); }}
          style={{
            background: theme.mode === "vibe" ? "var(--color-primary)" : "var(--color-surface)",
            color: theme.mode === "vibe" ? "var(--color-text-inverse)" : "var(--color-text)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-button)",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Vibe (V)
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {THEME_VARIANTS.map((variant) => (
          <button
            key={variant}
            type="button"
            onClick={() => { theme.setVariant(variant); }}
            style={{
              background: theme.variant === variant ? "var(--color-primary)" : "var(--color-surface)",
              color: theme.variant === variant ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-button)",
              padding: "0.25rem 0.75rem",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            {themes[variant].name}
          </button>
        ))}
      </div>

      <hr style={{ borderColor: "var(--color-border)", margin: "1.5rem 0" }} />

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-card)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-card)",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "var(--color-text)" }}>Card</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            This is a card with the theme&apos;s surface, border, radius, and shadow applied.
          </p>
        </div>

        <div
          style={{
            background: "var(--color-surface-elevated)",
            borderRadius: "var(--radius-card)",
            padding: "1.5rem",
            boxShadow: "var(--shadow-elevated)",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "var(--color-text)" }}>Elevated</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            An elevated surface with stronger shadow.
          </p>
        </div>

        <div
          style={{
            background: "var(--color-surface-glass)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-card)",
            padding: "1.5rem",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <h3 style={{ marginBottom: "0.5rem", color: "var(--color-text)" }}>Glass</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
            A glassmorphism surface using the glass variable.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        <span
          style={{
            background: "var(--color-primary)",
            color: "var(--color-text-inverse)",
            borderRadius: "var(--radius-full, 9999px)",
            padding: "0.25rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Primary
        </span>
        <span
          style={{
            background: "var(--color-success-subtle)",
            color: "var(--color-success)",
            borderRadius: "var(--radius-full, 9999px)",
            padding: "0.25rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Success
        </span>
        <span
          style={{
            background: "var(--color-warning-subtle)",
            color: "var(--color-warning)",
            borderRadius: "var(--radius-full, 9999px)",
            padding: "0.25rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Warning
        </span>
        <span
          style={{
            background: "var(--color-danger-subtle)",
            color: "var(--color-danger)",
            borderRadius: "var(--radius-full, 9999px)",
            padding: "0.25rem 0.75rem",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          Danger
        </span>
      </div>
    </div>
  );
};

const meta: Meta<typeof ThemeProvider> = {
  title: "Design System/ThemeProvider",
  component: ThemeProvider,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "ThemeProvider is the foundation of the EAIP Design System. It manages theme variant selection, light/dark mode, system preference detection, and reduced motion support. It injects CSS custom properties into the DOM and sets data attributes for Tailwind CSS integration.",
      },
    },
    a11y: {
      element: "#storybook-root",
      config: { rules: [{ id: "color-contrast", enabled: true }] },
    },
  },
  argTypes: {
    defaultMode: {
      control: "select",
      options: ["system", "light", "dark"],
      description: "Default color scheme mode",
      defaultValue: "system",
    },
    defaultVariant: {
      control: "select",
      options: THEME_VARIANTS,
      description: "Default theme variant",
      defaultValue: "enterprise-light",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeProvider>;

export const Default: Story = {
  args: {
    defaultMode: "system",
    defaultVariant: "enterprise-light",
  },
  render: (args) => (
    <ThemeProvider {...args}>
      <DemoContent />
    </ThemeProvider>
  ),
};

export const EnterpriseLight: Story = {
  name: "Enterprise Light",
  parameters: {
    docs: { description: { story: "Professional light theme optimized for productivity applications." } },
  },
  args: { defaultMode: "light", defaultVariant: "enterprise-light" },
  render: (args) => (
    <ThemeProvider {...args}>
      <DemoContent />
    </ThemeProvider>
  ),
};

export const EnterpriseDark: Story = {
  name: "Enterprise Dark",
  parameters: {
    docs: { description: { story: "Professional dark theme reducing eye strain in low-light environments." } },
  },
  args: { defaultMode: "dark", defaultVariant: "enterprise-dark" },
  render: (args) => (
    <ThemeProvider {...args}>
      <DemoContent />
    </ThemeProvider>
  ),
};

export const ExecutiveGlass: Story = {
  name: "Executive Glass",
  parameters: {
    docs: { description: { story: "Premium glassmorphism theme with frosted glass surfaces and vibrant accents." } },
  },
  args: { defaultMode: "dark", defaultVariant: "executive-glass" },
  render: (args) => (
    <ThemeProvider {...args}>
      <DemoContent />
    </ThemeProvider>
  ),
};

export const Midnight: Story = {
  name: "Midnight",
  parameters: {
    docs: { description: { story: "Deep midnight theme with navy/black backgrounds and cool blue accents." } },
  },
  args: { defaultMode: "dark", defaultVariant: "midnight" },
  render: (args) => (
    <ThemeProvider {...args}>
      <DemoContent />
    </ThemeProvider>
  ),
};

export const HighContrast: Story = {
  name: "High Contrast",
  parameters: {
    docs: { description: { story: "Maximum contrast theme for accessibility compliance. Uses pure black/white with bold borders." } },
  },
  args: { defaultMode: "light", defaultVariant: "high-contrast" },
  render: (args) => (
    <ThemeProvider {...args}>
      <DemoContent />
    </ThemeProvider>
  ),
};

export const Interactive: Story = {
  name: "Interactive Demo",
  parameters: {
    docs: { description: { story: "Interactive demo allowing real-time theme switching between all variants and modes." } },
  },
  render: () => (
    <ThemeProvider>
      <DemoContent />
    </ThemeProvider>
  ),
};
