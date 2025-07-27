
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ThreadsStore } from '@/types/store';
import type { Thread } from '@/types/api';

// INITIAL STATE

const initialThreadsState = {
  threads: [],
  currentThread: null,
  isLoading: false,
  error: null,
  lastFetch: null,
  searchQuery: '',
  filteredThreads: [],
};

// STORE IMPLEMENTATION


export const useThreadsStore = create<ThreadsStore>()(
  devtools(
    (set, get) => ({
      ...initialThreadsState,
      

      
      setThreads: (threads: Thread[]) => {
        set({ 
          threads, 
          lastFetch: Date.now(),
          error: null
        }, false, 'threads/setThreads');
        
        // Update filtered threads based on current search
        get().filterThreads();
      },
      
      addThread: (thread: Thread) => {
        const { threads } = get();
        const newThreads = [thread, ...threads];
        
        set({ threads: newThreads }, false, 'threads/addThread');
        get().filterThreads();
      },
      
      updateThread: (id: string, updates: Partial<Thread>) => {
        const { threads } = get();
        const updatedThreads = threads.map(thread =>
          thread.id === id ? { ...thread, ...updates } : thread
        );
        
        set({ threads: updatedThreads }, false, 'threads/updateThread');
        get().filterThreads();
      },
      
      removeThread: (id: string) => {
        const { threads, currentThread } = get();
        const filteredThreads = threads.filter(thread => thread.id !== id);
        
        set({ 
          threads: filteredThreads,
          currentThread: currentThread?.id === id ? null : currentThread
        }, false, 'threads/removeThread');
        
        get().filterThreads();
      },
      
      setCurrentThread: (thread: Thread | null) => {
        set({ currentThread: thread }, false, 'threads/setCurrentThread');
      },
      
      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'threads/setIsLoading');
      },
      
      setError: (error: string | null) => {
        set({ error }, false, 'threads/setError');
      },
      
      
      setSearchQuery: (query: string) => {
        set({ searchQuery: query }, false, 'threads/setSearchQuery');
        get().filterThreads();
      },
      
      filterThreads: () => {
        const { threads, searchQuery } = get();
        
        if (!searchQuery.trim()) {
          set({ filteredThreads: threads }, false, 'threads/clearFilter');
          return;
        }
        
        const query = searchQuery.toLowerCase();
        const filtered = threads.filter(thread => 
          thread.title.toLowerCase().includes(query) ||
          thread.content.toLowerCase().includes(query) ||
          thread.metadata?.tags?.some(tag => 
            tag.toLowerCase().includes(query)
          )
        );
        
        set({ filteredThreads: filtered }, false, 'threads/filterThreads');
      },
      
      
      reset: () => {
        set(initialThreadsState, false, 'threads/reset');
      },
    }),
    {
      name: 'threads-store',
    }
  )
);



export const threadsSelectors = {
  // Get current threads state
  getCurrentState: () => useThreadsStore.getState(),
  
  // Get threads to display (filtered or all)
  getDisplayThreads: () => {
    const state = useThreadsStore.getState();
    return state.searchQuery ? state.filteredThreads : state.threads;
  },
  
  // Get thread by ID
  getThreadById: (id: string) => {
    const state = useThreadsStore.getState();
    return state.threads.find(thread => thread.id === id);
  },
  
  // Get recent threads (last 7 days)
  getRecentThreads: () => {
    const state = useThreadsStore.getState();
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    return state.threads.filter(thread => 
      new Date(thread.createdAt).getTime() > weekAgo
    );
  },
  
  // Get threads grouped by date
  getGroupedThreads: () => {
    const state = useThreadsStore.getState();
    const threads = state.searchQuery ? state.filteredThreads : state.threads;
    
    const grouped: Record<string, Thread[]> = {};
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    threads.forEach(thread => {
      const threadDate = new Date(thread.createdAt);
      const dateString = threadDate.toDateString();
      
      let groupKey: string;
      if (dateString === today) {
        groupKey = 'Today';
      } else if (dateString === yesterday) {
        groupKey = 'Yesterday';
      } else {
        groupKey = threadDate.toLocaleDateString();
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(thread);
    });
    
    return grouped;
  },
  
  // Get search statistics
  getSearchStats: () => {
    const state = useThreadsStore.getState();
    return {
      totalThreads: state.threads.length,
      filteredCount: state.filteredThreads.length,
      hasActiveSearch: !!state.searchQuery,
      searchQuery: state.searchQuery,
    };
  },
};