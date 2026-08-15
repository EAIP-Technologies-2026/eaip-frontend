export const tokens = {
  color: {
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },
    primary: {
      50: "#eef0fa",
      100: "#dcdff5",
      200: "#b9bceb",
      300: "#969adf",
      400: "#7378d3",
      500: "#4338ca",
      600: "#3730a3",
      700: "#2e288a",
      800: "#282370",
      900: "#231e5a",
      950: "#1a1642",
    },
    success: {
      50: "#f0fdf4",
      500: "#22c55e",
      900: "#14532d",
    },
    warning: {
      50: "#fffbeb",
      500: "#f59e0b",
      900: "#78350f",
    },
    danger: {
      50: "#fef2f2",
      500: "#ef4444",
      900: "#7f1d1d",
    },
  },
  spacing: {
    0: "0px",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
  },
  typography: {
    fontFamily: {
      sans: "Inter, system-ui, -apple-system, sans-serif",
      mono: "JetBrains Mono, Fira Code, monospace",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
  radius: {
    none: "0px",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  motion: {
    duration: {
      instant: "0ms",
      micro: "100ms",
      fast: "150ms",
      normal: "250ms",
      medium: "350ms",
      slow: "450ms",
      deliberate: "600ms",
    },
    easing: {
      linear: "linear",
      ease: "ease",
      "ease-in": "ease-in",
      "ease-out": "ease-out",
      "ease-in-out": "ease-in-out",
      premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      snappy: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    },
    spring: {
      stiffness: 300,
      damping: 30,
      mass: 1,
    },
  },
} as const;

export type TokenColor = typeof tokens.color;
export type TokenSpacing = typeof tokens.spacing;
export type TokenTypography = typeof tokens.typography;
export type TokenShadow = typeof tokens.shadow;
export type TokenRadius = typeof tokens.radius;
export type TokenMotion = typeof tokens.motion;

export type DesignTokens = typeof tokens;
