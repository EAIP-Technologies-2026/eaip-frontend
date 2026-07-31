# EAIP Frontend

Enterprise Autonomous Intelligence Platform — Frontend Monorepo

## Overview

The EAIP Frontend is a premium Enterprise AI Platform user interface built as a Next.js Turborepo monorepo. It powers five specialized applications that together provide a cohesive enterprise intelligence operating system.

## Applications

| App | Port | Purpose |
|-----|------|---------|
| **Enterprise Console** | 3000 | Primary executive dashboard — agent management, analytics, monitoring, marketplace |
| **Mission Control** | 3001 | Operations center — workflow orchestration, mission planning, event management |
| **Workspace** | 3002 | Knowledge & memory management — document upload, search, memory curation |
| **Administration** | 3003 | Identity & governance — user management, roles, permissions, system health |
| **Mobile** | 3004 | Field technician interface — memory access, quick actions, activity feed |

## Architecture

```
eaip-frontend/
├── apps/                    # 5 Next.js applications
│   ├── enterprise-console/  # Executive intelligence console
│   ├── mission-control/     # Operations command center
│   ├── workspace/           # Knowledge & memory workspace
│   ├── administration/      # Identity & administration
│   └── mobile/              # Mobile field interface
├── packages/                # 51 shared packages
│   ├── ui-enterprise/       # Enterprise shell, header, sidebar, data grid
│   ├── ui-foundation/       # Dialog, card, accordion, dropdown primitives
│   ├── ui-primitives/       # Button, input, badge, chip base components
│   ├── ui-visualizations/   # Charts, metrics, timelines, status widgets
│   ├── design-tokens/       # CSS custom properties & Tailwind theme
│   ├── auth/                # Authentication context, guards, token storage
│   ├── api/                 # Enterprise REST client with retry & interceptors
│   ├── state/               # Zustand-based platform store
│   ├── icons/               # EnterpriseIcon component (Lucide-based)
│   ├── theme/               # Dark/light mode with system preference
│   └── ...                  # Domain packages (agent, workflow, memory, etc.)
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Backend running on `localhost:8080`

## Quick Start

```bash
# From the root workspace (C:\GitHub\EAIP Technologies)
node scripts/eaip-dev.js

# Or manually:
cd eaip-frontend
pnpm install
pnpm dev          # Starts all 5 apps via Turborepo
```

Individual apps:
```bash
pnpm --filter enterprise-console dev
pnpm --filter mission-control dev
pnpm --filter workspace dev
pnpm --filter administration dev
pnpm --filter mobile dev
```

## Build

```bash
pnpm build        # Builds all apps and packages
```

## Quality Gates

```bash
pnpm lint         # ESLint across all packages
pnpm typecheck    # TypeScript compilation
pnpm test         # Vitest unit tests
pnpm e2e          # Playwright end-to-end tests
```

## Development Workflow

### Adding a Package

1. Create under `packages/<name>/`
2. Add `package.json` with `"name": "@eaip/<name>"`
3. Export from `src/index.ts`
4. Add to `pnpm-workspace.yaml`
5. Import from `@eaip/<name>` in apps

### Design System

All visual elements must use design tokens:
- Colors: `text-text`, `text-text-secondary`, `bg-surface`, `border-border`
- Semantic: `text-primary`, `text-danger`, `text-success`, `text-warning`
- Spacing: Tailwind utilities (e.g., `p-6`, `gap-4`, `space-y-8`)
- Typography: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`

Never use hardcoded Tailwind colors (e.g., `text-gray-500`, `bg-red-50`).

### Authentication

Apps use `@eaip/auth`:
- `RequireAuth` wrapper for protected pages
- `useAuth()` hook for login/logout/user state
- Tokens stored in `localStorage` (JWT)
- Automatic `Authorization: Bearer <token>` header injection

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_EAIP_API_MODE=development
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9 (strict mode)
- **Styling**: Tailwind CSS 4 + CSS custom properties
- **State**: Zustand
- **Charts**: Recharts
- **Testing**: Vitest + Playwright
- **Package Manager**: pnpm + Turborepo

## License

UNLICENSED — Proprietary software

---

*For backend documentation, see `../eaip-platform/README.md`*
*For full platform documentation, see `../docs/`*
