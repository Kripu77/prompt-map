import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReasoningPanelState {
  isVisible: boolean;
  reasoningContent: string;
  isStreaming: boolean;
  currentTopic?: string;
  isAutoVisible: boolean; // New: tracks if panel is auto-shown during generation
  
  // Actions
  setVisible: (visible: boolean) => void;
  setReasoningContent: (content: string) => void;
  appendReasoningContent: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setCurrentTopic: (topic?: string) => void;
  clearReasoning: () => void;
  toggleVisibility: () => void;
  showForGeneration: () => void; // New: show panel during active generation
  hideAfterGeneration: () => void; // New: hide panel after generation completes
  showForSavedThread: () => void; // New: show panel for saved thread reasoning
}

export const useReasoningPanelStore = create<ReasoningPanelState>()(
  persist(
    (set, get) => ({
      isVisible: false,
      reasoningContent: '',
      isStreaming: false,
      currentTopic: undefined,
      isAutoVisible: false,
      
      setVisible: (visible) => set({ isVisible: visible }),
      
      setReasoningContent: (content) => set({ reasoningContent: content }),
      
      appendReasoningContent: (content) => set((state) => ({ 
        reasoningContent: state.reasoningContent + content 
      })),
      
      setStreaming: (streaming) => {
        set({ isStreaming: streaming });
        
        // Don't auto-show panel when streaming starts - let user control visibility
        // if (streaming) {
        //   set({ isVisible: true, isAutoVisible: true });
        // }
      },
      
      setCurrentTopic: (topic) => set({ currentTopic: topic }),
      
      clearReasoning: () => set({ 
        reasoningContent: '', 
        isStreaming: false,
        currentTopic: undefined 
      }),
      
      toggleVisibility: () => set((state) => ({ 
        isVisible: !state.isVisible,
        isAutoVisible: false // Manual toggle overrides auto behavior
      })),
      
      showForGeneration: () => set({ 
        isVisible: true, 
        isAutoVisible: true 
      }),
      
      hideAfterGeneration: () => {
        const currentState = get();
        if (currentState.isAutoVisible) {
          set({ isVisible: false, isAutoVisible: false });
        }
      },
      
      showForSavedThread: () => set({ 
        isVisible: true, 
        isAutoVisible: false // Manual show for saved threads
      }),
    }),
    {
      name: 'reasoning-panel-storage',
      partialize: () => ({ 
        // Don't persist auto-visibility state
        isVisible: false // Reset visibility on page load
      }),
    }
  )
);