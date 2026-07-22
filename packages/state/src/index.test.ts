import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { useAppStore } from "./index";

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
