import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  showSidebarTheme: boolean;
  setShowSidebarTheme: (show: boolean) => void;
  showBottomActions: boolean;
  setShowBottomActions: (show: boolean) => void;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      // For preview: set true now; can flip to false later in settings
      showProfile: true,
      setShowProfile: (show) => set({ showProfile: show }),
      showSidebarTheme: true,
      setShowSidebarTheme: (show) => set({ showSidebarTheme: show }),
      showBottomActions: true,
      setShowBottomActions: (show) => set({ showBottomActions: show }),
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "sidebar-storage",
      onRehydrateStorage: () => (state) => {
        // Called after hydration from storage finishes
        state?.setHasHydrated?.(true);
      },
    }
  )
);


