# AUTHENTICATION FOUNDATION REPORT
**EAIP Frontend — Architecture & Implementation Document**
**Version**: 1.0.0 (Stabilized)

---

## 1. Package Architecture
The `@eaip/auth` package is positioned at the foundational platform layer within the EAIP monorepo dependency hierarchy:

```
                  ┌──────────────────────────────┐
                  │       Workspace Apps         │
                  │ (enterprise-console, etc.)   │
                  └──────────────┬───────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │    @eaip/ui-enterprise       │
                  └──────────────┬───────────────┘
                                 │
                  ┌──────────────▼───────────────┐
                  │          @eaip/auth          │
                  └──────┬───────────────┬───────┘
                         │               │
          ┌──────────────▼──────┐ ┌──────▼──────────────┐
          │      @eaip/api      │ │    @eaip/config       │
          └─────────────────────┘ └─────────────────────┘
```

* **Module Division**:
  * `types.ts`: TypeScript contracts for `AuthUser`, `AuthTokens`, `LoginCredentials`, `AuthState`, and `AuthContextType`.
  * `storage.ts`: Abstracted token persistence engine (`getStoredTokens`, `storeTokens`, `clearStoredTokens`, `tokenProvider`) with automatic in-memory fallback.
  * `service.ts`: `ApiAuthService` implementing `AuthService` (`login`, `logout`, `getCurrentUser`, `refreshToken`) via `@eaip/api`.
  * `context.tsx`: `AuthProvider`, `useAuth`, `useCurrentUser`, `useIsAuthenticated` React context manager handling state transitions and session event listeners.
  * `guards.tsx`: Higher-order Client Components (`RequireAuth`, `RequireRole`, `RedirectIfAuthenticated`) managing route access control.
  * `index.ts`: Public package export barrier.

---

## 2. Authentication Lifecycle

```
    [ Unauthenticated ]
             │
             │ Login Credentials (POST /auth/login)
             ▼
      [ Authenticated ] ◄─── Session Restoration (GET /users/me)
             │
             ├─── 401 Unauthorized / Token Expiration ───► Token Refresh (POST /auth/refresh)
             │                                                     │
             │                                            ┌────────┴────────┐
             │                                         Success           Failure
             │                                            │                 │
             │                                            ▼                 ▼
             │                                     [ Active Token ]  [ Session Expired Event ]
             │                                                              │
             ▼                                                              ▼
       [ Logout ] ──────────────────────────────────────────────────► [ Unauthenticated ]
```

---

## 3. Login Flow
1. **User Action**: User enters credentials into `LoginShell` (`apps/*/src/app/login/page.tsx`).
2. **Context Trigger**: Form invokes `login({ email, password })` from `useAuth()`.
3. **API Request**: `ApiAuthService.login()` sends a `POST /auth/login` payload `{ username: email, password }` to the backend.
4. **Token Persistence**: Upon receiving `{ token, refresh_token, user }`, `storeTokens()` writes `token` and `refresh_token` to storage.
5. **State Mutation**: `AuthProvider` updates state (`user`, `token`, `loading: false`, `error: null`).
6. **State Sync & Navigation**: `PlatformStateSync` synchronizes `user` to `usePlatformStore`, and Next.js router navigates to `/dashboard`.

---

## 4. Logout Flow
1. **User Action**: User clicks "Sign out" inside `UserProfileMenu` (`packages/ui-enterprise`).
2. **Context Trigger**: Menu handler invokes `logout()` from `useAuth()`.
3. **API Notification**: `ApiAuthService.logout()` sends a best-effort `POST /auth/logout`.
4. **Storage Clearing**: `clearStoredTokens()` purges `eaip_access_token` and `eaip_refresh_token`.
5. **State Reset**: `AuthProvider` resets state (`user: null`, `token: null`, `loading: false`, `error: null`).
6. **Redirect**: User is redirected to `/login`.

---

## 5. Refresh Flow
1. **Trigger Condition**: 
   * On initial session restoration, if `getCurrentUser()` returns 401 or null while a `refreshToken` exists in storage, OR
   * Direct invocation of `authService.refreshToken(refreshToken)`.
2. **API Request**: `POST /auth/refresh` with `{ refresh_token }`.
3. **Token Update**: Backend returns `{ token, refresh_token }`; `storeTokens()` updates active storage.
4. **Session Recovery**: `getCurrentUser()` is re-attempted with the new access token.
5. **Failure Fallback**: If token refresh fails, storage is cleared and the `eaip:session-expired` event is dispatched.

---

## 6. Session Restoration
1. **App Initialization**: On initial mount, `AuthProvider` executes `restoreSession()`.
2. **Token Inspection**: `getStoredTokens()` reads `eaip_access_token`. If absent, set `loading: false` and finish.
3. **Current User Fetch**: Calls `authService.getCurrentUser()`.
4. **Validation**: If user data is returned, set `user`, `token`, `loading: false`. If 401, execute Refresh Flow fallback.
5. **Storage Cleanup**: If restoration fails completely, purge tokens and transition to `user: null`.

---

## 7. Route Guards
* **`RequireAuth`**: Wraps protected page layouts (`/dashboard`, `/memory`, etc.). If `!isAuthenticated` once `!loading`, redirects to `/login`. Displays `SessionLoading` spinner during validation.
* **`RequireRole`**: Extends `RequireAuth`. Verifies `user.roles.includes(requiredRole)`. Redirects to `/unauthorized` if missing permissions.
* **`RedirectIfAuthenticated`**: Wraps public auth routes (e.g., `/login`). If `isAuthenticated`, redirects active user to `/dashboard`.

---

## 8. Providers & App Wrapping Order
Every application in the monorepo wraps its component tree using `AppProviders`:

```tsx
<ThemeProvider>
  <AuthProvider onSessionExpired={() => router.push("/login")}>
    <PlatformStateSync>
      {children}
    </PlatformStateSync>
  </AuthProvider>
</ThemeProvider>
```

---

## 9. Storage Model
* **Keys**:
  * `eaip_access_token`
  * `eaip_refresh_token`
* **Storage Engine**: `window.localStorage` when available in browser environments.
* **In-Memory Fallback**: Automatically activates if `window.localStorage` is restricted or unavailable (e.g., SSR, sandboxed iFrames, JS-DOM test runners).

---

## 10. Event Flow
1. **API Interception**: `@eaip/api`'s `createDefaultClient` registers an `onResponse` interceptor.
2. **401 Detection**: If any API response returns status `401 Unauthorized`, the client dispatches a `window.CustomEvent("eaip:session-expired")`.
3. **Context Listener**: `AuthProvider` listens for `eaip:session-expired`.
4. **Automatic Eviction**: Purges tokens, sets state error `"Session expired. Please sign in again."`, and triggers `onSessionExpired?.()` to force login redirection across all active tabs.

---

## 11. Dependency Graph
```
@eaip/auth
 ├── @eaip/api (ApiClient, ApiError, createDefaultClient)
 ├── @eaip/config (getConfig -> apiUrl)
 ├── @eaip/logging (logger.error)
 ├── react (createContext, useContext, useState, useEffect, useMemo, useCallback)
 └── next/navigation (useRouter)
```

---

## 12. Test Coverage
* **Suite Path**: `packages/auth/src/index.test.ts`
* **Covered Modules**:
  * `Token Storage`: verifies `getStoredTokens`, `storeTokens`, `clearStoredTokens`, `tokenProvider`.
  * `Auth Service Factory`: verifies `createAuthService` initialization and interface contract.
  * `Auth Package Exports`: verifies all context hooks (`useAuth`, `useCurrentUser`, `useIsAuthenticated`) and route guard components (`RequireAuth`, `RequireRole`, `RedirectIfAuthenticated`).
* **Test Status**: 100% PASS (30/30 workspace test suites passing).

---

## 13. Known Limitations
1. **Mock API Fallback**: In offline development mode (`isMockMode()`), authentication uses simulated JWT tokens stored in memory/localStorage.
2. **Single Domain Scope**: Local storage keys are scoped to the current origin; cross-subdomain SSO requires cookie-based session management or token exchange middleware.
