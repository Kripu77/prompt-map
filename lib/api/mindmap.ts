import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
interface PromptPayload {
  prompt: string
  context?: {
    originalPrompt?: string
    existingMindmap?: unknown // Changed from any
    previousPrompts?: string[]
    isFollowUp?: boolean
    checkTopicShift?: boolean
  }
}

interface TopicShiftResponse {
  isTopicShift: boolean
}

interface MindmapResponse {
  content: unknown // Changed from any
}

interface AnonymousMindmapData {
    prompt: string;
    content: string;
    title: string;
    sessionId: string;
    userAgent: string;
    referrer: string;
  }
  

export interface Thread {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    userId: string;
  }
  
  export type ThreadUpdateData = {
    title?: string;
    content?: string;
  }
  

// API calls
export function useCheckTopicShift() {
  return useMutation({
    mutationFn: async (payload: PromptPayload) => {
      const response = await fetch('/api/check-topic-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        throw new Error('Failed to check topic shift')
      }
      
      return response.json() as Promise<TopicShiftResponse>
    }
  })
}

export function useGenerateMindmap() {
  return useMutation({
    mutationFn: async (payload: PromptPayload) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate mind map')
      }
      
      return response.json() as Promise<MindmapResponse>
    }
  })
}


  // API call function separated for clean mutation setup
  export const recordMindmapAPI = async (data: AnonymousMindmapData): Promise<boolean> => {
    const response = await fetch('/api/analytics/anonymous-mindmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json() as ErrorResponse; // Changed from any
      throw new Error(errorData.error || errorData.message || 'Failed to record mindmap analytics');
    }
    
    return true;
  };


// Thread API Functions
export async function fetchThreadsAPI(): Promise<{ threads: Thread[] }> {
  const response = await fetch('/api/threads');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch threads');
  }
  
  return response.json();
}

export async function getThreadAPI(id: string): Promise<{ thread: Thread }> {
  const response = await fetch(`/api/threads/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to load thread');
  }
  
  return response.json();
}

export async function createThreadAPI({ title, content }: { title: string, content: string }): Promise<{ thread: Thread }> {
  const response = await fetch('/api/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create thread');
  }
  
  return response.json();
}

// Hook to create thread with proper cache management
export function useCreateThread() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createThreadAPI,
    onSuccess: () => {
      // Invalidate the threads query to trigger a controlled refetch
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    }
  });
}

export async function updateThreadAPI({ id, updates }: { id: string, updates: ThreadUpdateData }): Promise<{ thread: Thread }> {
  const response = await fetch(`/api/threads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update thread');
  }
  
  return response.json();
}

export async function deleteThreadAPI(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/threads/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete thread');
  }
  
  return { success: true };
}

interface ErrorResponse {
  error?: string;
  message?: string;
}