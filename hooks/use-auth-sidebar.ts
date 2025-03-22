"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSidebarStore } from '@/lib/store';
import { useThreads } from './use-threads';

/**
 * A hook that automatically opens the sidebar when a user logs in
 * and handles loading threads
 */
export function useAuthSidebar() {
  const { status, data: session } = useSession();
  const [prevStatus, setPrevStatus] = useState(status);
  const { setIsOpen } = useSidebarStore();
  const { fetchThreads } = useThreads();
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on mount
    checkMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-open sidebar when user logs in
  useEffect(() => {
    // Only trigger when status changes from unauthenticated/loading to authenticated
    if (prevStatus !== "authenticated" && status === "authenticated") {
      // Don't auto-open on mobile as it could be intrusive
      if (!isMobile) {
        // Fetch threads and open sidebar
        fetchThreads().then(() => {
          setIsOpen(true);
        });
      } else {
        // Just fetch threads in the background on mobile, but don't open sidebar
        fetchThreads();
      }
    }

    // Update previous status for next comparison
    setPrevStatus(status);
  }, [status, prevStatus, setIsOpen, fetchThreads, isMobile]);

  return {
    isAuthenticated: status === "authenticated",
    userId: session?.user?.id,
  };
} 