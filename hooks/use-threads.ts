import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  userId: string;
};

export function useThreads() {
  const { data: session, status } = useSession();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  const fetchThreads = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/threads');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch threads');
      }
      
      const data = await response.json();
      setThreads(data.threads);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load threads');
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  const createThread = useCallback(async (title: string, content: string) => {
    if (status !== 'authenticated' || !session?.user) {
      toast.error('You must be signed in to save a thread');
      return null;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create thread');
      }
      
      const data = await response.json();
      
      // Update the threads list with the new thread
      setThreads((prev) => [data.thread, ...prev]);
      toast.success('Mindmap saved successfully');
      
      return data.thread;
    } catch (err) {
      console.error('Error creating thread:', err);
      toast.error('Failed to save thread');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  const loadThread = useCallback(async (id: string) => {
    if (status !== 'authenticated' || !session?.user) {
      return null;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/threads/${id}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load thread');
      }
      
      const data = await response.json();
      setSelectedThread(data.thread);
      return data.thread;
    } catch (err) {
      console.error('Error loading thread:', err);
      toast.error('Failed to load thread');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, status]);

  const updateThread = useCallback(async (id: string, updates: { title?: string; content?: string }) => {
    if (status !== 'authenticated' || !session?.user) {
      return null;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/threads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update thread');
      }
      
      const data = await response.json();
      
      // Update the threads list
      setThreads((prev) => 
        prev.map((thread) => (thread.id === id ? data.thread : thread))
      );
      
      // Update selected thread if it's the one being updated
      if (selectedThread?.id === id) {
        setSelectedThread(data.thread);
      }
      
      toast.success('Thread updated successfully');
      return data.thread;
    } catch (err) {
      console.error('Error updating thread:', err);
      toast.error('Failed to update thread');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session, status, selectedThread]);

  const deleteThread = useCallback(async (id: string) => {
    if (status !== 'authenticated' || !session?.user) {
      return false;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/threads/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete thread');
      }
      
      // Remove the thread from the list
      setThreads((prev) => prev.filter((thread) => thread.id !== id));
      
      // Clear selected thread if it's the one being deleted
      if (selectedThread?.id === id) {
        setSelectedThread(null);
      }
      
      toast.success('Thread deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting thread:', err);
      toast.error('Failed to delete thread');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session, status, selectedThread]);

  // Load threads on mount and when session changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchThreads();
    }
  }, [status, fetchThreads]);

  return {
    threads,
    isLoading,
    error,
    selectedThread,
    setSelectedThread,
    fetchThreads,
    createThread,
    loadThread,
    updateThread,
    deleteThread,
    isAuthenticated: status === 'authenticated',
  };
} 