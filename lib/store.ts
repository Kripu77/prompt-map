import { initialMindMapValue } from '@/app/data';
import { create } from 'zustand';

type MindmapState = {
  prompt: string;
  isLoading: boolean;
  mindmapData: string;
  mindmapRef: SVGSVGElement | null;
  setPrompt: (prompt: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setMindmapData: (data: string) => void;
  setMindmapRef: (ref: SVGSVGElement) => void;
};

export const useMindmapStore = create<MindmapState>((set) => ({
  prompt: 'AI-Powered Mind Map Generator',
  isLoading: false,
  mindmapData: initialMindMapValue,
  mindmapRef: null,
  
  setPrompt: (prompt) => set({ prompt }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setMindmapData: (data) => set({ mindmapData: data }),
  setMindmapRef: (ref) => set({ mindmapRef: ref }),
}));