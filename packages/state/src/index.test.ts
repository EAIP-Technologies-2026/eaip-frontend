import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { useAppStore, usePlatformStore } from "./index";

describe("useAppStore", () => {
  it("has initial state", async () => {
    const state = useAppStore.getState();
    await expect(state.sidebarOpen).toBe(true);
    await expect(state.sidebarWidth).toBe(280);
  });

  it("toggles sidebar", async () => {
    useAppStore.getState().toggleSidebar();
    await expect(useAppStore.getState().sidebarOpen).toBe(false);
  });
});

describe("usePlatformStore", () => {
  it("has initial state", async () => {
    const state = usePlatformStore.getState();
    await expect(state.sidebarOpen).toBe(true);
    await expect(state.activeRoute).toBe("/dashboard");
    await expect(state.user).toBeNull();
    await expect(state.workspaces.length).toBeGreaterThan(0);
  });

  it("sets user and derives permissions", async () => {
    usePlatformStore.getState().setUser({
      id: "1",
      email: "admin@example.com",
      name: "Admin",
      roles: ["admin"],
    });
    const state = usePlatformStore.getState();
    await expect(state.user?.name).toBe("Admin");
    await expect(state.hasPermission("admin:users")).toBe(true);
    await expect(state.hasPermission("view:agents")).toBe(true);
  });

  it("tracks active route and breadcrumbs", async () => {
    usePlatformStore
      .getState()
      .setActiveRoute("/agents", [{ label: "Dashboard", href: "/dashboard" }, { label: "Agents" }]);
    const state = usePlatformStore.getState();
    await expect(state.activeRoute).toBe("/agents");
    await expect(state.breadcrumbs.length).toBe(2);
  });
});
