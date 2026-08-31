import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
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
        destination: `${process.env.BACKEND_URL ?? "http://127.0.0.1:8080"}/api/:path*`,
      },
      {
        source: "/metrics",
        destination: `${process.env.BACKEND_URL ?? "http://127.0.0.1:8080"}/metrics`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
