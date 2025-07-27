"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSidebarStore } from '@/lib/stores/sidebar-store';
import { useThreads } from './use-threads';
import { useQueryClient } from '@tanstack/react-query';

/**
 * A hook that automatically opens the sidebar when a user logs in
 * and handles loading threads with optimized query behavior
 */
export function useAuthSidebar() {
  const { status, data: session } = useSession();
  const [prevStatus, setPrevStatus] = useState(status);
  const { setIsOpen } = useSidebarStore();
  const { fetchThreads, isLoading } = useThreads();
  const queryClient = useQueryClient();
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
      // Ensure threads are prefetched and up-to-date
      const loadThreadsData = async () => {
        // First invalidate and refetch through the useThreads hook
        await fetchThreads();
        
        // For better performance, also ensure we prefetch the data
        // This ensures the data is available immediately when needed
        queryClient.prefetchQuery({
          queryKey: ['threads'],
          staleTime: 1000 * 60 * 5, // 5 minutes
        });
      };

      if (!isMobile) {
        // For desktop: fetch threads and then open sidebar
        loadThreadsData().then(() => {
          setIsOpen(true);
        });
      } else {
        // For mobile: just fetch threads in background
        loadThreadsData();
      }
    }

    setPrevStatus(status);
  }, [status, prevStatus, setIsOpen, fetchThreads, queryClient, isMobile]);

  // Return useful information
  return {
    isAuthenticated: status === "authenticated",
    userId: session?.user?.id,
    isLoadingThreads: isLoading
  };
}