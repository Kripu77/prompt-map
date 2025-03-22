import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Initialize or retrieve session ID
  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);
  
  const recordAnonymousMindmap = useCallback(async (
    prompt: string, 
    content: any, 
    title: string = "Untitled"
  ) => {
    try {
      // Skip for authenticated users - their data is already tracked
      if (status === 'authenticated') return true;
      
      // Make sure we have a session ID for anonymous users
      const currentSessionId = sessionId || getOrCreateSessionId();
      if (!currentSessionId) return false;
      
      setIsSubmitting(true);
      
      // Get browser information
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;
      
      // Submit to the anonymous analytics endpoint
      const response = await fetch('/api/analytics/anonymous-mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          title,
          content,
          sessionId: currentSessionId,
          userAgent,
          referrer
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error recording anonymous analytics:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [status, sessionId]);
  
  return {
    recordAnonymousMindmap,
    isSubmitting,
    sessionId
  };
} 