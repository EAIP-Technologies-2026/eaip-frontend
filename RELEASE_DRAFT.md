# RELEASE DRAFT — EAIP Alpha UX Foundation v1.0

> Draft for the GitHub release of `eaip-frontend`. Adjust before publishing.

## Metadata

| Field | Value |
|---|---|
| Release | `frontend-foundation-v1.0` |
| Tag | `frontend-foundation-v1.0` |
| Branch | `alpha-runtime-integration` |
| Commit | `f818e83` `feat(frontend): establish Alpha UX foundation` |
| Status | Published (branch + tag pushed to `origin`) |

## Summary

Alpha UX foundation baseline for the EAIP frontend monorepo:

- **Monorepo:** pnpm workspaces + Turborepo — 31 workspace projects (25 shared packages, 5 apps)
- **Applications:** `administration`, `enterprise-console`, `mission-control`, `mobile`, `workspace`
- **Shared packages:** design system (design tokens, theme, typography, icons, ui-primitives/foundation/enterprise/visualizations, accessibility), runtime clients (agent, api, auth, knowledge, memory, realtime, workflow), foundation (config, core, feature-flags, hooks, logging, state, telemetry, testing, utilities)
- **Tooling:** ESLint, Prettier, TypeScript, Vitest, Storybook/Chromatic, changesets, husky

## Verification

| Gate | Result |
|---|---|
| `pnpm lint` | PASS (30/30 packages) |
| `pnpm typecheck` | PASS (30/30) |
| `pnpm test` | PASS (29/29) |
| `pnpm build` | PASS (all 5 apps) |

## Fixed in this release

- `pnpm-workspace.yaml` contained a placeholder value for `@sentry/cli` that broke dependency verification; replaced with `true`.

## Known issues (do not block publish)

- GitHub Dependabot reports 15 vulnerabilities on the default branch (8 high, 6 moderate, 1 low) — schedule a dependency review.

## Checklist

- [x] Baseline committed on `alpha-runtime-integration` (`f818e83`)
- [x] Branch pushed to `origin`
- [x] Tag `frontend-foundation-v1.0` created and pushed
- [ ] Publish release notes on GitHub (copy from this draft)
