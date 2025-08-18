

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ReactFlowInstance } from '@xyflow/react';
import { initialMindMapValue } from '@/app/data';
import type { MindmapStore, PromptHistoryItem } from '@/types/store';


const initialMindmapState = {
  prompt: 'AI-Powered Mind Map Generator',
  isLoading: false,
  mindmapData: initialMindMapValue,
  mindmapRef: null,
  isUserGenerated: false,
  isFollowUpMode: false,
  error: null,
  lastGeneratedAt: null,
  promptHistory: [],
};


export const useMindmapStore = create<MindmapStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialMindmapState,
        
 
        setPrompt: (prompt: string) => {
          set({ prompt }, false, 'mindmap/setPrompt');
        },
        
        setIsLoading: (isLoading: boolean) => {
          set({ isLoading }, false, 'mindmap/setIsLoading');
        },
        
        setMindmapData: (data: string) => {
          set({ 
            mindmapData: data, 
            lastGeneratedAt: Date.now(),
            error: null // Clear any previous errors
          }, false, 'mindmap/setMindmapData');
        },
        
        setMindmapRef: (ref: ReactFlowInstance) => {
          set({ mindmapRef: ref }, false, 'mindmap/setMindmapRef');
        },
        
        setIsUserGenerated: (isGenerated: boolean) => {
          set({ isUserGenerated: isGenerated }, false, 'mindmap/setIsUserGenerated');
        },
        
        setIsFollowUpMode: (isFollowUp: boolean) => {
          set({ isFollowUpMode: isFollowUp }, false, 'mindmap/setIsFollowUpMode');
        },
        
        setError: (error: string | null) => {
          set({ error }, false, 'mindmap/setError');
        },
        
    
        addToHistory: (item: PromptHistoryItem) => {
          const { promptHistory } = get();
          const newHistory = [...promptHistory, item];
          
          if (newHistory.length > 50) {
            newHistory.splice(0, newHistory.length - 50);
          }
          
          set({ promptHistory: newHistory }, false, 'mindmap/addToHistory');
        },
        
        clearHistory: () => {
          set({ promptHistory: [] }, false, 'mindmap/clearHistory');
        },
        

        reset: () => {
          set(initialMindmapState, false, 'mindmap/reset');
        },
      }),
      {
        name: 'mindmap-store',
        partialize: (state) => ({
          prompt: state.prompt,
          isFollowUpMode: state.isFollowUpMode,
          promptHistory: state.promptHistory.slice(-10), // Only last 10 items
        }),
      }
    ),
    {
      name: 'mindmap-store',
    }
  )
);

export const mindmapSelectors = {
  getCurrentState: () => useMindmapStore.getState(),
  
  isReady: () => {
    const state = useMindmapStore.getState();
    return !state.isLoading && state.mindmapData && !state.error;
  },
  
  getLatestPrompt: () => {
    const state = useMindmapStore.getState();
    return state.promptHistory[state.promptHistory.length - 1];
  },
  
  hasFollowUps: () => {
    const state = useMindmapStore.getState();
    return state.promptHistory.some(item => item.isFollowUp);
  },
  
  getStats: () => {
    const state = useMindmapStore.getState();
    return {
      totalPrompts: state.promptHistory.length,
      followUpCount: state.promptHistory.filter(item => item.isFollowUp).length,
      lastGenerated: state.lastGeneratedAt,
      hasError: !!state.error,
    };
  },
};