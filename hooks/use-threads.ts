import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  useQuery, 
  useMutation, 
  useQueryClient
} from '@tanstack/react-query';
import {
  fetchThreadsAPI,
  getThreadAPI,
  createThreadAPI,
  updateThreadAPI,
  deleteThreadAPI
} from '@/lib/api/mindmap';
import type { Thread, ThreadUpdateRequest } from '@/types/api';

export function useThreads() {
  const { data: session, status } = useSession();
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const queryClient = useQueryClient();
  const isAuthenticated = status === 'authenticated';
  
  // Query for fetching all threads
  const threadsQuery = useQuery({
    queryKey: ['threads'],
    queryFn: fetchThreadsAPI,
    enabled: isAuthenticated,
    select: (data) => data.threads,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for creating a new thread
  const createThreadMutation = useMutation({
    mutationFn: createThreadAPI,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      toast.success("Mindmap saved successfully", { duration: 1000 });
    },
    onError: (error) => {
      console.error('Error creating thread:', error);
      toast.error('Failed to save thread');
    }
  });
  
  // Mutation for updating a thread
  const updateThreadMutation = useMutation({
    mutationFn: updateThreadAPI,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      
      // Update the selected thread if it's the one being edited
      if (selectedThread?.id === data.thread.id) {
        setSelectedThread(data.thread);
      }
      
      toast.success('Thread updated successfully');
    },
    onError: (error) => {
      console.error('Error updating thread:', error);
      toast.error('Failed to update thread');
    }
  });
  
  // Mutation for deleting a thread
  const deleteThreadMutation = useMutation({
    mutationFn: deleteThreadAPI,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      
      // Clear selected thread if it's the one being deleted
      if (selectedThread?.id === variables) {
        setSelectedThread(null);
      }
      
      toast.success('Thread deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting thread:', error);
      toast.error('Failed to delete thread');
    }
  });
  
  // Wrapper functions to maintain the same API

  // Create thread with auth check
  const isAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  const createThread = useCallback(async (title: string, content: string, reasoning?: string) => {
    if (!isAuthenticatedRef.current) {
      toast.error('You must be signed in to save a thread');
      return null;
    }

    console.log('createThread called with:', {
      title,
      contentLength: content?.length || 0,
      reasoningLength: reasoning?.length || 0,
      hasReasoning: !!reasoning,
      reasoningPreview: reasoning ? reasoning.substring(0, 100) + '...' : 'No reasoning'
    });

    try {
      const result = await createThreadMutation.mutateAsync({ title, content, reasoning });
      console.log('Thread created successfully:', {
        threadId: result.thread.id,
        hasReasoningInResult: !!result.thread.reasoning
      });
      return result.thread;
    } catch (err) {
      console.error('Error in createThread:', err);
      return null;
    }
  }, [isAuthenticated]);

  // Load specific thread
  const loadThread = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const result = await queryClient.fetchQuery({
        queryKey: ['thread', id],
        queryFn: () => getThreadAPI(id)
      });
      
      setSelectedThread(result.thread);
      return result.thread;
    } catch (err) {
      console.error('Error loading thread:', err);
      toast.error('Failed to load thread');
      return null;
    }
  }, [isAuthenticated, queryClient]);

  // Update thread
  const updateThread = useCallback(async (id: string, updates: ThreadUpdateRequest) => {
    if (!isAuthenticated) {
      return null;
    }

    try {
      const result = await updateThreadMutation.mutateAsync({ id, updates });
      return result.thread;
    } catch (err) {
      return null;
    }
  }, [isAuthenticated, updateThreadMutation]);

  // Delete thread
  const deleteThread = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      await deleteThreadMutation.mutateAsync(id);
      return true;
    } catch (err) {
      return false;
    }
  }, [isAuthenticated, deleteThreadMutation]);

  // Manually trigger refetch
  const fetchThreads = useCallback(() => {
    if (isAuthenticated) {
      return queryClient.invalidateQueries({ queryKey: ['threads'] });
    }
  }, [isAuthenticated, queryClient]);

  return {
    threads: threadsQuery.data || [],
    isLoading: threadsQuery.isPending || 
               createThreadMutation.isPending || 
               updateThreadMutation.isPending || 
               deleteThreadMutation.isPending,
    error: threadsQuery.error?.message || null,
    selectedThread,
    setSelectedThread,
    fetchThreads,
    createThread,
    loadThread,
    updateThread,
    deleteThread,
    isAuthenticated,
    
  };
}