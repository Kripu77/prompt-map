
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SidebarStore } from '@/types/store';


const initialSidebarState = {
  isOpen: false,
  isCollapsed: false,
  width: 320,
  isAnimating: false,
  lastToggleTime: 0,
};


export const useSidebarStore = create<SidebarStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialSidebarState,
        

        
        setIsOpen: (isOpen: boolean) => {
          const now = Date.now();
          set({ 
            isOpen, 
            lastToggleTime: now,
            isAnimating: true
          }, false, 'sidebar/setIsOpen');
          
          // Clear animation state after transition
          setTimeout(() => {
            set({ isAnimating: false }, false, 'sidebar/clearAnimation');
          }, 300);
        },
        
        setIsCollapsed: (isCollapsed: boolean) => {
          set({ isCollapsed }, false, 'sidebar/setIsCollapsed');
        },
        
        setWidth: (width: number) => {
          // Clamp width between reasonable bounds
          const clampedWidth = Math.max(280, Math.min(600, width));
          set({ width: clampedWidth }, false, 'sidebar/setWidth');
        },
        
        setIsAnimating: (isAnimating: boolean) => {
          set({ isAnimating }, false, 'sidebar/setIsAnimating');
        },
        

        
        toggle: () => {
          const { isOpen } = get();
          const now = Date.now();
          
          set({ 
            isOpen: !isOpen, 
            lastToggleTime: now,
            isAnimating: true
          }, false, 'sidebar/toggle');
          
          // Clear animation state after transition
          setTimeout(() => {
            set({ isAnimating: false }, false, 'sidebar/clearAnimation');
          }, 300);
        },
        
        collapse: () => {
          set({ 
            isCollapsed: true, 
            isOpen: false,
            isAnimating: true
          }, false, 'sidebar/collapse');
          
          setTimeout(() => {
            set({ isAnimating: false }, false, 'sidebar/clearAnimation');
          }, 300);
        },
        
        expand: () => {
          set({ 
            isCollapsed: false, 
            isOpen: true,
            isAnimating: true
          }, false, 'sidebar/expand');
          
          setTimeout(() => {
            set({ isAnimating: false }, false, 'sidebar/clearAnimation');
          }, 300);
        },
        

        
        reset: () => {
          set(initialSidebarState, false, 'sidebar/reset');
        },
      }),
      {
        name: 'sidebar-store',
        partialize: (state) => ({
          isOpen: state.isOpen,
          width: state.width,
          isCollapsed: state.isCollapsed,
        }),
      }
    ),
    {
      name: 'sidebar-store',
    }
  )
);



export const sidebarSelectors = {
  // Get current sidebar state
  getCurrentState: () => useSidebarStore.getState(),
  
  // Check if sidebar is fully open and ready
  isFullyOpen: () => {
    const state = useSidebarStore.getState();
    return state.isOpen && !state.isCollapsed && !state.isAnimating;
  },
  
  // Check if sidebar is in transition
  isTransitioning: () => {
    const state = useSidebarStore.getState();
    return state.isAnimating;
  },
  
  // Get effective width (0 if closed/collapsed)
  getEffectiveWidth: () => {
    const state = useSidebarStore.getState();
    if (!state.isOpen || state.isCollapsed) return 0;
    return state.width;
  },
  
  // Check if recently toggled (within last 500ms)
  wasRecentlyToggled: () => {
    const state = useSidebarStore.getState();
    return Date.now() - state.lastToggleTime < 500;
  },
};