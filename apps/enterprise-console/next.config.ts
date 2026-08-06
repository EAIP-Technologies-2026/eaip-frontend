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
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://localhost:8080"}/api/:path*`,
      },
    ];
  },
  sentryCli: {
    organization: process.env.SENTRY_ORG ?? "",
    project: process.env.SENTRY_PROJECT ?? "",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  },
};

export default nextConfig;
