import { initalMindMapValue } from '@/app/data';
import { create } from 'zustand';
import { RefObject } from 'react';

type MindmapState = {
  prompt: string;
  isLoading: boolean;
  mindmapData: string;
  mindmapRef: RefObject<HTMLDivElement> | null;
  setPrompt: (prompt: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setMindmapData: (data: string) => void;
  setMindmapRef: (ref: RefObject<HTMLDivElement>) => void;
};

export const useMindmapStore = create<MindmapState>((set) => ({
  prompt: '',
  isLoading: false,
  mindmapData: initalMindMapValue,
  mindmapRef: null,
  
  setPrompt: (prompt) => set({ prompt }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setMindmapData: (data) => set({ mindmapData: data }),
  setMindmapRef: (ref) => set({ mindmapRef: ref }),
}));