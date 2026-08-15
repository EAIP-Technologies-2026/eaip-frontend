# EAIP FRONTEND RC-1 REMEDIATION PLAN
**Release Candidate 1 — Post-Release Optimization & Remediation Roadmap**
**Date**: August 7, 2026

---

## Executive Summary
The **RC-1 Engineering Audit** confirmed **zero Critical (P0) Blockers** across the EAIP monorepo. This remediation plan outlines non-blocking technical debt items, minor optimization targets, and effort estimates for Sprint 4.

---

## 1. Prioritized Remediation Backlog

| Priority | Item Code | Category | Item Description | Estimated Effort | Target Milestone |
|----------|-----------|----------|──────────────────|------------------|------------------|
| **P0** | — | Critical | *No P0 blockers identified. Monorepo is 100% build-safe and test-passing.* | 0h | Current (RC-1) |
| **P1** | **P1-1** | Architecture | **Mock API Package Isolation**: Extract `installMockApi` fetch interceptors into a dedicated `@eaip/mock-server` package to strip dev mock data from production tree-shaking outputs. | 4h | Sprint 4A |
| **P2** | **P2-1** | Security / Auth | **Cookie-Based SSO Session Scoping**: Migrate `localStorage` token persistence in `@eaip/auth` to httpOnly cookies for seamless cross-subdomain SSO. | 6h | Sprint 4A |
| **P2** | **P2-2** | Testing | **E2E Playwright Expansion**: Expand Playwright test suites (`apps/workspace/e2e/`) to cover multi-step agent creation and document upload workflows. | 8h | Sprint 4B |
| **P3** | **P3-1** | Performance | **Dynamic Import Splitting**: Dynamically import `@eaip/ui-visualizations` chart widgets (`BarChartWidget`, `PieChartWidget`) using `next/dynamic` to reduce initial bundle size by 18 kB. | 3h | Sprint 4B |
| **P3** | **P3-2** | DX / Tooling | **Turbo Remote Caching Configuration**: Enable Vercel / Turbopack remote caching in CI/CD pipeline to accelerate CI builds from 27s to 2s. | 2h | Sprint 4C |

---

## 2. Detailed Task Breakdown & Implementation Guidance

### P1-1: Mock API Package Isolation (`@eaip/mock-server`)
* **Objective**: Decouple `installMockApi()` from application bundles into a standalone workspace package.
* **Impact**: Eliminates dev mock data arrays (`createMockAgents`, `createMockKnowledgeArticles`) from production bundles.
* **Target Files**: `apps/enterprise-console/src/mock-data/api-client.ts`, `apps/*/src/components/app-providers.tsx`.
* **Effort**: 4 Hours.

---

### P2-1: Cookie-Based SSO Session Scoping
* **Objective**: Introduce httpOnly cookie support in `ApiAuthService` and `tokenProvider`.
* **Impact**: Enables unified session sharing across `console.eaip.io`, `workspace.eaip.io`, and `missioncontrol.eaip.io`.
* **Target Files**: `packages/auth/src/storage.ts`, `packages/auth/src/service.ts`.
* **Effort**: 6 Hours.

---

### P2-2: E2E Playwright Expansion
* **Objective**: Add E2E tests for complex workflows: Agent Creation, Document Ingestion, and Mission Execution.
* **Impact**: Prevents regressions during rapid feature deployment.
* **Target Files**: `apps/workspace/e2e/agents.spec.ts`, `apps/workspace/e2e/knowledge.spec.ts`.
* **Effort**: 8 Hours.

---

## 3. Total Remediation Summary

* **P0 (Critical Blockers)**: 0 Hours
* **P1 (Major Optimizations)**: 4 Hours
* **P2 (Minor Enhancements)**: 14 Hours
* **P3 (Housekeeping / DX)**: 5 Hours
* **Total Estimated Effort**: **23 Hours** (Scheduled across Sprint 4).
