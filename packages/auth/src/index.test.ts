import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredTokens,
  storeTokens,
  clearStoredTokens,
  tokenProvider,
  createAuthService,
  AuthProvider,
  useAuth,
  useCurrentUser,
  useIsAuthenticated,
  RequireAuth,
  RequireRole,
  RedirectIfAuthenticated,
} from "./index";

describe("@eaip/auth Package", () => {
  beforeEach(() => {
    clearStoredTokens();
  });

  describe("Token Storage", () => {
    it("returns null when no tokens are stored", () => {
      expect(getStoredTokens()).toBeNull();
      expect(tokenProvider()).toBeNull();
    });

    it("stores and retrieves tokens correctly", () => {
      storeTokens({ accessToken: "mock-access-token", refreshToken: "mock-refresh-token" });
      const stored = getStoredTokens();
      expect(stored?.accessToken).toBe("mock-access-token");
      expect(stored?.refreshToken).toBe("mock-refresh-token");
      expect(tokenProvider()).toBe("mock-access-token");
    });

    it("clears stored tokens correctly", () => {
      storeTokens({ accessToken: "access-123", refreshToken: "refresh-123" });
      clearStoredTokens();
      expect(getStoredTokens()).toBeNull();
      expect(tokenProvider()).toBeNull();
    });
  });

  describe("Auth Service Factory", () => {
    it("creates an AuthService instance with tokenProvider", () => {
      const service = createAuthService(() => "test-token");
      expect(service).toBeDefined();
      expect(typeof service.login).toBe("function");
      expect(typeof service.logout).toBe("function");
      expect(typeof service.getCurrentUser).toBe("function");
      expect(typeof service.refreshToken).toBe("function");
    });
  });

  describe("Auth Package Exports", () => {
    it("exports all public components, hooks, and utilities", () => {
      expect(AuthProvider).toBeDefined();
      expect(useAuth).toBeDefined();
      expect(useCurrentUser).toBeDefined();
      expect(useIsAuthenticated).toBeDefined();
      expect(RequireAuth).toBeDefined();
      expect(RequireRole).toBeDefined();
      expect(RedirectIfAuthenticated).toBeDefined();
    });
  });
});
