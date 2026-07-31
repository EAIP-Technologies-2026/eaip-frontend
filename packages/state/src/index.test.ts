import { describe, it, expect } from "vitest";
import { useAppStore, usePlatformStore } from "./index";

describe("useAppStore", () => {
  it("has initial state", () => {
    const state = useAppStore.getState();
    expect(state.sidebarOpen).toBe(true);
    expect(state.sidebarWidth).toBe(280);
  });

  it("toggles sidebar", () => {
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(false);
  });
});

describe("usePlatformStore", () => {
  it("has initial state", () => {
    const state = usePlatformStore.getState();
    expect(state.sidebarOpen).toBe(true);
    expect(state.activeRoute).toBe("/dashboard");
    expect(state.user).toBeNull();
    expect(state.workspaces.length).toBeGreaterThan(0);
  });

  it("sets user and derives permissions", () => {
    usePlatformStore.getState().setUser({
      id: "1",
      email: "admin@example.com",
      name: "Admin",
      roles: ["admin"],
    });
    const state = usePlatformStore.getState();
    expect(state.user?.name).toBe("Admin");
    expect(state.hasPermission("admin:users")).toBe(true);
  });

  it("tracks active route and breadcrumbs", () => {
    usePlatformStore
      .getState()
      .setActiveRoute("/agents", [{ label: "Dashboard", href: "/dashboard" }, { label: "Agents" }]);
    const state = usePlatformStore.getState();
    expect(state.activeRoute).toBe("/agents");
    expect(state.breadcrumbs.length).toBe(2);
  });
});
