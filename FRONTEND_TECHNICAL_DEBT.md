# FRONTEND TECHNICAL DEBT REGISTRY
**EAIP Frontend — Monorepo Technical Debt & Optimization Log**
**Version**: v1.0.0-rc1
**Date**: August 7, 2026

---

## 1. Technical Debt Inventory

| Item ID | Category | Item Description | Priority | Effort Est. | Recommended Owner | Target Release |
|---------|----------|──────────────────|----------|-------------|-------------------|----------------|
| **P0-NONE** | — | *No P0 critical blockers found.* | P0 | 0 Hours | Core Platform Lead | Current (RC-1) |
| **P1-001** | Architecture | Extract dev-only mock fallback handlers into `@eaip/mock-server` package to optimize production bundle tree-shaking output. | P1 | 4 Hours | Frontend Architect | Sprint 4A |
| **P2-001** | Auth / Security | Migrate `localStorage` token fallback in `@eaip/auth` to httpOnly cookies to support cross-subdomain Enterprise SSO. | P2 | 6 Hours | Auth Lead | Sprint 4A |
| **P2-002** | Testing / QA | Expand Playwright E2E suites to cover multi-step agent execution and file drag-and-drop ingestion. | P2 | 8 Hours | QA Lead | Sprint 4B |
| **P3-001** | Performance | Code-split visualization chart widgets using `next/dynamic` to reduce initial load chunk size by ~18 kB. | P3 | 3 Hours | UI System Lead | Sprint 4B |
| **P3-002** | Infrastructure | Enable Turbo Remote Caching in GitHub Actions / CI pipeline to accelerate full monorepo CI builds from 27s to 2s. | P3 | 2 Hours | DevOps Lead | Sprint 4C |

---

## 2. Risk Mitigation & Impact Assessment

### P1-001: Mock Data Package Decoupling
* **Impact**: Dev fallback data currently sits alongside production service code. While safely ignored when live endpoints respond, isolating them into `@eaip/mock-server` reduces static build size by ~35 kB.
* **Remediation Strategy**: Move `mock-data/` adapters out of application source trees into a dedicated package.

### P2-001: Cookie-Based SSO Integration
* **Impact**: Origin-scoped `localStorage` restricts seamless seamless auth transfers between `console.eaip.io` and `workspace.eaip.io`.
* **Remediation Strategy**: Upgrade `tokenProvider` in `@eaip/auth` to set `SameSite=Lax` cookies.
