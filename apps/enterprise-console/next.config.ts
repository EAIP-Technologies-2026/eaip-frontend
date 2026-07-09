import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@eaip/design-tokens",
    "@eaip/theme",
    "@eaip/icons",
    "@eaip/typography",
    "@eaip/ui-primitives",
    "@eaip/ui-foundation",
    "@eaip/ui-enterprise",
    "@eaip/ui-visualizations",
    "@eaip/api",
    "@eaip/auth",
    "@eaip/realtime",
    "@eaip/agent",
    "@eaip/workflow",
    "@eaip/memory",
    "@eaip/knowledge",
    "@eaip/hooks",
    "@eaip/utilities",
    "@eaip/state",
    "@eaip/telemetry",
    "@eaip/logging",
    "@eaip/feature-flags",
    "@eaip/config",
    "@eaip/accessibility",
    "@eaip/testing",
  ],
};

export default nextConfig;
