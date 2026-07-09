import { describe, it, expect } from "vitest";
import { useAppStore } from "./index";

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