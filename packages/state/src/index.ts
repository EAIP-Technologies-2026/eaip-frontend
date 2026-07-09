import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface AppState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    sidebarOpen: true,
    sidebarWidth: 280,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarWidth: (width: number) => set({ sidebarWidth: width }),
  })),
);