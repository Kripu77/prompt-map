import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  PromptPayload, 
  TopicShiftResponse, 
  MindmapResponse, 
  AnonymousMindmapData,
  ThreadCreateRequest,
  ThreadUpdateRequest,
  ThreadsResponse,
  ThreadResponse,
  ThreadDeleteResponse,
  ApiError
} from '@/types/api';
  

// API calls
export function useCheckTopicShift() {
  return useMutation({
    mutationFn: async (payload: PromptPayload) => {
      const response = await fetch('/api/mindmap/topic-shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        throw new Error('Failed to check topic shift')
      }
      
      const result = await response.json()
      // The new API returns { success: true, data: { isTopicShift, confidence, reason, recommendation } }
      return result.data as TopicShiftResponse
    }
  })
}

export function useGenerateMindmap() {
  return useMutation({
    mutationFn: async (payload: PromptPayload) => {
      const response = await fetch('/api/mindmap/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate mind map')
      }
      
      const result = await response.json()
      // The new API returns { success: true, data: { content, metadata } }
      return result.data as MindmapResponse
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
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || errorData.message || 'Failed to record mindmap analytics');
  }
  
  return true;
};


// Thread API Functions
export async function fetchThreadsAPI(): Promise<ThreadsResponse> {
  const response = await fetch('/api/threads');
  
  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || errorData.message || 'Failed to fetch threads');
  }
  
  const result = await response.json();
  // The new API returns { success: true, data: { threads: [...] } }
  return result.data as ThreadsResponse;
}

export async function getThreadAPI(id: string): Promise<ThreadResponse> {
  const response = await fetch(`/api/threads/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || errorData.message || 'Failed to load thread');
  }
  
  const result = await response.json();
  // The new API returns { success: true, data: { thread: {...} } }
  return result.data as ThreadResponse;
}

export async function createThreadAPI(data: ThreadCreateRequest): Promise<ThreadResponse> {
  const response = await fetch('/api/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || errorData.message || 'Failed to create thread');
  }
  
  const result = await response.json();
  // The new API returns { success: true, data: { thread: {...} } }
  return result.data as ThreadResponse;
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

export async function updateThreadAPI({ id, updates }: { id: string, updates: ThreadUpdateRequest }): Promise<ThreadResponse> {
  const response = await fetch(`/api/threads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || errorData.message || 'Failed to update thread');
  }
  
  const result = await response.json();
  // The new API returns { success: true, data: { thread: {...} } }
  return result.data as ThreadResponse;
}

export async function deleteThreadAPI(id: string): Promise<ThreadDeleteResponse> {
  const response = await fetch(`/api/threads/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json() as ApiError;
    throw new Error(errorData.error || errorData.message || 'Failed to delete thread');
  }
  
  const result = await response.json();
  // The new API returns { success: true, data: { success: true, deletedId: "..." } }
  return result.data as ThreadDeleteResponse;
}