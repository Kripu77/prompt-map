import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { recordMindmapAPI } from '@/lib/api/mindmap';

// Session ID management for anonymous users
const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = localStorage.getItem('anonymous_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('anonymous_session_id', sessionId);
  }
  return sessionId;
};


export function useAnonymousAnalytics() {
  const { status } = useSession();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Initialize or retrieve session ID
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);
  
  // Set up mutation for recording mindmap data
  const mutation = useMutation({
    mutationFn: recordMindmapAPI,
    onError: (error) => {
      console.error('Error recording anonymous analytics:', error);
    }
  });

  // Wrapper function that prepares the data and calls the mutation
  const recordAnonymousMindmap = useCallback(async (
    prompt: string, 
    content: any, 
    title: string = "Untitled"
  ) => {
    // Skip for authenticated users - their data is already tracked
    if (status === 'authenticated') return true;
    
    // Make sure we have a session ID for anonymous users
    const currentSessionId = sessionId || getOrCreateSessionId();
    if (!currentSessionId) return false;
    
    try {
      // Get browser information
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;
      
      // Submit using the mutation
      await mutation.mutateAsync({
        prompt,
        title,
        content,
        sessionId: currentSessionId,
        userAgent,
        referrer
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }, [status, sessionId, mutation]);
  
  return {
    recordAnonymousMindmap,
    isSubmitting: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    sessionId
  };
}