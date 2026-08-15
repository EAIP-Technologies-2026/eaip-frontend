# FRONTEND TRACEABILITY MATRIX
**EAIP Frontend — Screen & API Traceability Matrix**
**Version**: v1.0.0-rc1
**Date**: August 7, 2026

---

## Screen Traceability Table

| Screen Route | Application | Source File | Component Tree | Backend Endpoint | API Client | Store / Hooks | Tests | WCAG AA Status | Status |
|--------------|-------------|-------------|----------------|------------------|------------|---------------|-------|----------------|--------|
| `/login` | `enterprise-console` | `app/login/page.tsx` | `LoginShell`, `Input`, `Button`, `Banner` | `/auth/login` | `@eaip/auth` | `useAuth()`, `useForm()` | `index.test.ts` | 100% PASS | FULLY IMPLEMENTED |
| `/dashboard` | `enterprise-console` | `app/dashboard/page.tsx` | `EnterpriseShell`, `MetricCard`, `DataGrid`, `Timeline` | `/system/health`, `/monitoring/events` | `services/health-service` | `usePlatformStore()`, `useFallback()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/agents` | `enterprise-console` | `app/agents/page.tsx` | `EnterpriseShell`, `DataGrid`, `Dialog`, `ConfirmDialog` | `/agents`, `/agents/create` | `services/agents-service` | `usePlatformStore()`, `useConfirm()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/agents/[id]` | `enterprise-console` | `app/agents/[id]/page.tsx` | `EnterpriseShell`, `MetricCard`, `DataGrid`, `Input` | `/agents/:id`, `/agents/:id/execute` | `services/agents-service` | `useRealtime()`, `useConfirm()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/monitoring` | `enterprise-console` | `app/monitoring/page.tsx` | `EnterpriseShell`, `MetricCard`, `PieChartWidget`, `Timeline` | `/monitoring/events` | `services/monitoring-service` | `usePlatformStore()`, `useFallback()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/marketplace` | `enterprise-console` | `app/marketplace/page.tsx` | `EnterpriseShell`, `Input`, `Badge`, `Button`, `EmptyState` | `/marketplace/integrations` | Mock Adapter | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/login` | `workspace` | `app/login/page.tsx` | `LoginShell`, `Input`, `Button` | `/auth/login` | `@eaip/auth` | `useAuth()` | `index.test.ts` | 100% PASS | FULLY IMPLEMENTED |
| `/dashboard` | `workspace` | `app/dashboard/page.tsx` | `EnterpriseShell`, `Card`, `Button`, `SectionHeader` | `/knowledge/summary` | `@eaip/knowledge` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/knowledge` | `workspace` | `app/knowledge/page.tsx` | `EnterpriseShell`, `DataGrid`, `ProgressBar`, `Card`, `Dialog` | `/knowledge`, `/knowledge/upload` | `@eaip/knowledge` | `useDebounce()`, `useConfirm()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/documents` | `workspace` | `app/documents/page.tsx` | `EnterpriseShell`, `DataGrid`, `Badge` | `/knowledge/documents` | `@eaip/knowledge` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/memory` | `workspace` | `app/memory/page.tsx` | `EnterpriseShell`, `DataGrid`, `Dialog`, `Input` | `/memory/entries` | `@eaip/memory` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/login` | `mission-control` | `app/login/page.tsx` | `LoginShell`, `Input`, `Button` | `/auth/login` | `@eaip/auth` | `useAuth()` | `index.test.ts` | 100% PASS | FULLY IMPLEMENTED |
| `/dashboard` | `mission-control` | `app/dashboard/page.tsx` | `EnterpriseShell`, `DataGrid`, `MetricCard` | `/missions/summary` | `services/missions-service` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/missions` | `mission-control` | `app/missions/page.tsx` | `EnterpriseShell`, `DataGrid`, `Dialog`, `ConfirmDialog` | `/missions`, `/missions/create` | `services/missions-service` | `useConfirm()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/workflows` | `mission-control` | `app/workflows/page.tsx` | `EnterpriseShell`, `DataGrid`, `Dialog`, `Button` | `/workflows` | `@eaip/workflow` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/workflows/[id]/designer` | `mission-control` | `app/workflows/[id]/designer/page.tsx` | `EnterpriseShell`, Visual Node Canvas | `/workflows/:id` | `@eaip/workflow` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/login` | `administration` | `app/login/page.tsx` | `LoginShell`, `Input`, `Button` | `/auth/login` | `@eaip/auth` | `useAuth()` | `index.test.ts` | 100% PASS | FULLY IMPLEMENTED |
| `/dashboard` | `administration` | `app/dashboard/page.tsx` | `EnterpriseShell`, `SectionHeader`, `Card` | `/admin/summary` | `@eaip/api` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/users` | `administration` | `app/users/page.tsx` | `EnterpriseShell`, `DataGrid`, `RequireRole` | `/admin/users` | `@eaip/api` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/roles` | `administration` | `app/roles/page.tsx` | `EnterpriseShell`, `DataGrid`, `RequireRole` | `/admin/roles` | `@eaip/api` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/permissions` | `administration` | `app/permissions/page.tsx` | `EnterpriseShell`, `DataGrid`, `RequireRole` | `/admin/permissions` | `@eaip/api` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/login` | `mobile` | `app/login/page.tsx` | `MobileLoginShell`, `Input`, `Button` | `/auth/login` | `@eaip/auth` | `useAuth()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
| `/dashboard` | `mobile` | `app/dashboard/page.tsx` | `MobileShell`, `Card`, `Badge` | `/mobile/dashboard` | `@eaip/api` | `usePlatformStore()` | `page.test.tsx` | 100% PASS | FULLY IMPLEMENTED |
