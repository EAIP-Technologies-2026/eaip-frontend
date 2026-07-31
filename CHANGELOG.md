# Changelog

All notable changes to the EAIP Frontend are documented here.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0-alpha.1] - 2026-07-31

### Added

- **Monorepo foundation:** pnpm workspaces + Turborepo with 31 workspace projects (25 shared packages, 5 apps, root tooling)
- **Applications:** `administration`, `enterprise-console`, `mission-control`, `mobile`, `workspace` (Next.js App Router)
- **Shared packages:** design system (`@eaip/design-tokens`, `@eaip/theme`, `@eaip/typography`, `@eaip/icons`, `@eaip/ui-primitives`, `@eaip/ui-foundation`, `@eaip/ui-enterprise`, `@eaip/ui-visualizations`, `@eaip/accessibility`), runtime clients (`@eaip/agent`, `@eaip/api`, `@eaip/auth`, `@eaip/knowledge`, `@eaip/memory`, `@eaip/realtime`, `@eaip/workflow`), and foundation (`@eaip/config`, `@eaip/core`, `@eaip/feature-flags`, `@eaip/hooks`, `@eaip/logging`, `@eaip/state`, `@eaip/telemetry`, `@eaip/testing`, `@eaip/utilities`)
- Tooling: ESLint, Prettier, TypeScript, Vitest, Storybook/Chromatic config, changesets, husky hooks

### Changed

- Build-approval policy for native dependencies declared in `pnpm-workspace.yaml` (`allowBuilds`)

### Fixed

- `pnpm-workspace.yaml` placeholder value for `@sentry/cli` replaced with a valid boolean so `pnpm install` and all workspace gates complete successfully

### Verified

- Quality gates green at baseline: `lint` (30/30), `typecheck` (30/30), `test` (29/29), `build` (all 5 apps)

---

## [Unreleased]

### Planned

- Full storybook/chromatic publishing, e2e suites, and production deployment configuration.
