import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface SidePanelState {
  isOpen: boolean;
  width: number;
}

export interface SidePanelActions {
  setIsOpen: (isOpen: boolean) => void;
  setWidth: (width: number) => void;
  toggle: () => void;
}

export type SidePanelStore = SidePanelState & SidePanelActions;

const initialState: SidePanelState = {
  isOpen: false,
  width: 40, // 40% width on desktop by default
};

export const useSidePanelStore = create<SidePanelStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setIsOpen: (isOpen: boolean) => {
        set({ isOpen }, false, 'sidePanel/setIsOpen');
      },
      
      setWidth: (width: number) => {
        set({ width }, false, 'sidePanel/setWidth');
      },
      
      toggle: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen }, false, 'sidePanel/toggle');
      },
    }),
    {
      name: 'side-panel-store',
    }
  )
);