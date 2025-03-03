import { create } from 'zustand';

type MindmapState = {
  prompt: string;
  isLoading: boolean;
  mindmapData: string;
  setPrompt: (prompt: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setMindmapData: (data: string) => void;
};

export const useMindmapStore = create<MindmapState>((set) => ({
  prompt: '',
  isLoading: false,
  mindmapData: '',
  setPrompt: (prompt) => set({ prompt }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setMindmapData: (data) => set({ mindmapData: data }),
}));