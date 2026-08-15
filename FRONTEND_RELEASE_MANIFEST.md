# FRONTEND RELEASE MANIFEST
**EAIP Frontend — RC-1 Final Release Manifest**
**Version**: v1.0.0-rc1
**Date**: August 7, 2026

---

## 1. Monorepo Applications & Route Registry

### 1.1 `enterprise-console` (`apps/enterprise-console`)
* **Framework**: Next.js 14 App Router (Static Export & Dynamic SSR)
* **Port**: 3000
* **Routes**:
  * `/login`: Authentication split-screen login page
  * `/dashboard`: Executive command dashboard (KPI cards, System Health, Monitoring Alerts, Activity Timeline)
  * `/agents`: Agent workforce fleet list (DataGrid, filter, search, create/edit/delete modal)
  * `/agents/[id]`: Agent detail profile, execution control toolbar (play, pause, stop, retry), event stream
  * `/monitoring`: Telemetry event stream, severity distribution pie chart, alert acknowledgment
  * `/marketplace`: Third-party integration hub, pack catalog, category filter, install/uninstall toggle
  * `/unauthorized`: Standardized 403 access denial view

### 1.2 `workspace` (`apps/workspace`)
* **Framework**: Next.js 14 App Router
* **Port**: 3001
* **Routes**:
  * `/login`: Standardized auth login page
  * `/dashboard`: Personal workspace dashboard (quick launch, knowledge & memory stats)
  * `/knowledge`: Knowledge base management, drag-and-drop file upload, collection filtering, document search
  * `/documents`: Document list DataGrid, ingestion status tracking
  * `/memory`: Key-value memory store management, entry creation dialog

### 1.3 `mission-control` (`apps/mission-control`)
* **Framework**: Next.js 14 App Router
* **Port**: 3002
* **Routes**:
  * `/login`: Standardized auth login page
  * `/dashboard`: Mission control executive summary strip & mission list
  * `/missions`: Mission orchestration DataGrid, creation modal, execution triggers
  * `/workflows`: Workflow catalog, workflow creation modal
  * `/workflows/[id]/designer`: Interactive visual workflow node canvas & step configuration

### 1.4 `administration` (`apps/administration`)
* **Framework**: Next.js 14 App Router
* **Port**: 3003
* **Routes**:
  * `/login`: Standardized auth login page
  * `/dashboard`: Governance summary strip, user & role overview
  * `/users`: Admin user directory DataGrid (`RequireRole("admin")`)
  * `/roles`: Role-based access control (RBAC) role definition grid
  * `/permissions`: Permission policy matrix inspection grid

### 1.5 `mobile` (`apps/mobile`)
* **Framework**: Next.js 14 App Router (Mobile Responsive Shell)
* **Port**: 3004
* **Routes**:
  * `/login`: Mobile compact login screen
  * `/dashboard`: Mobile operational dashboard & quick action list

---

## 2. Shared Workspace Packages (26 Packages)

1. `@eaip/accessibility`: WCAG 2.1 AA focus trap, announcer, skip links, aria utils.
2. `@eaip/agent`: Agent domain models, execution types, state interfaces.
3. `@eaip/api`: Central HTTP API client, fetch interceptors, error formatters.
4. `@eaip/auth`: JWT auth context, `RequireAuth`, `RequireRole`, token storage & fallback.
5. `@eaip/config`: Workspace TypeScript, ESLint, Tailwind, Next.js configurations.
6. `@eaip/core`: System types, base domain interfaces.
7. `@eaip/design-tokens`: Frozen TEDS design tokens (colors, spacing, shadows, radius, typography).
8. `@eaip/feature-flags`: Feature flag context & evaluation hooks.
9. `@eaip/hooks`: Shared React hooks (`useDebounce`, `useLocalStorage`, `useMediaQuery`, `useWindowSize`).
10. `@eaip/icons`: `@eaip/icons` registry, SVG `EnterpriseIcon` components (`"alert"`, `"activity"`, `"search"`, etc.).
11. `@eaip/knowledge`: Knowledge base document models, collection types, knowledge client.
12. `@eaip/logging`: Structured logger wrapper.
13. `@eaip/memory`: Memory store models, memory API client.
14. `@eaip/motion`: Frame motion primitives (`Fade`, `Slide`, `Scale`), `useReducedMotion()`.
15. `@eaip/realtime`: Realtime WebSocket/SSE event subscription hooks (`useRealtime`).
16. `@eaip/state`: Zustand platform state store (`usePlatformStore`, `useAppStore`).
17. `@eaip/telemetry`: OpenTelemetry trace context propagation helpers.
18. `@eaip/testing`: Vitest & React Testing Library common test utilities.
19. `@eaip/theme`: Sovereign Calm theme provider, mode toggling (`light`/`dark`), inline script.
20. `@eaip/typography`: Standardized typography primitives (`Heading`, `Text`, `Label`, `Code`).
21. `@eaip/ui-enterprise`: `EnterpriseShell`, `AppHeader`, `AppSidebar`, `DataGrid`, `SectionHeader`, `ConfirmDialog`, `GlobalSearchTrigger`, `GlobalSearchDialog`, `UserMenu`, `WorkspaceSwitcher`.
22. `@eaip/ui-foundation`: `Card`, `CardHeader`, `CardContent`, `Dialog`, `Alert`, `Toast`, `ToastContainer`, `Banner`, `DropdownMenu`, `TabNav`, `Sidebar`.
23. `@eaip/ui-primitives`: `Button`, `Badge`, `Input`, `EmptyState`, `ProgressBar`, `FormField`, `InputGroup`, `SearchInput`, `RadioGroup`, `ToggleGroup`, `Chip`, `Spinner`, `Box`, `Flex`, `Stack`, `Grid`, `Container`.
24. `@eaip/ui-visualizations`: `MetricCard`, `StatusWidget`, `StatusRing`, `Timeline`, `BarChartWidget`, `PieChartWidget`.
25. `@eaip/utilities`: Formatting helpers (`formatBytes`, `formatDate`, `clamp`).
26. `@eaip/workflow`: Workflow domain models, execution status types.

---

## 3. Providers & State Stores
* **Providers**: `AuthProvider` (`@eaip/auth`), `ThemeProvider` (`@eaip/theme`), `FallbackProvider` (`services/fallback-context`), `ToastContainer` (`@eaip/ui-foundation`).
* **Zustand State Stores**: `usePlatformStore` (`@eaip/state`), `useAppStore` (`@eaip/state`).

---

## 4. Quality Gate Test Suites (30/30 PASS)
* `@eaip/ui-primitives`: `Button.test.tsx`, `button.a11y.test.tsx`, `layout.test.tsx`, `new-components.test.tsx`, `foundation.test.tsx` (98 tests).
* `@eaip/ui-foundation`: `index.test.tsx`, `new-components.test.tsx`, `foundation.test.tsx` (45 tests).
* `@eaip/ui-enterprise`: `index.test.tsx`, `app-sidebar.test.tsx`, `app-header.test.tsx`, `breadcrumbs.test.tsx`, `user-menu.test.tsx`, `workspace-switcher.test.tsx` (16 tests).
* `@eaip/ui-visualizations`: `index.test.tsx` (2 tests).
* `@eaip/auth`: `index.test.ts` (Storage, Auth Service, Auth Context tests).
* `@eaip/theme`: `index.test.tsx`, `theme-script.test.tsx`, `index.a11y.test.tsx`.
* `@eaip/state`: `index.test.ts` (5 tests).
* Application Smoke Tests: `page.test.tsx` across `enterprise-console`, `workspace`, `mission-control`, `administration`, `mobile`.
