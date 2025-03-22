"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useThreads, Thread } from "@/hooks/use-threads";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Skeleton } from "./skeleton";
import {
  FileText,
  Trash2,
  Clock,
  Search,
  ChevronDown,
} from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, differenceInDays, differenceInMinutes, differenceInHours } from "date-fns";
import { useMindmapStore, useSidebarStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import { Input } from "./input";
import { setSidebarHandler } from "./header";

// Custom close sidebar icon component
function SidebarCloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="9" y1="5" x2="9" y2="19" />
      <line x1="9" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// Interface to group threads by time periods
interface GroupedThreads {
  today: Thread[];
  yesterday: Thread[];
  previous7Days: Thread[];
  previous30Days: Thread[];
  older: Thread[];
}

const emptyGroupedThreads: GroupedThreads = {
  today: [],
  yesterday: [],
  previous7Days: [],
  previous30Days: [],
  older: [],
};

export function ThreadsSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupedThreads, setGroupedThreads] = useState<GroupedThreads>(emptyGroupedThreads);
  const [displayLimit, setDisplayLimit] = useState<number>(12);
  const [hasMoreThreads, setHasMoreThreads] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { threads, isLoading, selectedThread, loadThread, deleteThread, fetchThreads } = useThreads();
  const { isOpen, setIsOpen } = useSidebarStore();
  const { mindmapData, setMindmapData } = useMindmapStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const pathname = usePathname();

  // Register the sidebar handler for backward compatibility
  useEffect(() => {
    setSidebarHandler(setIsOpen);
    // Return a cleanup function
    return () => {
      // Use a no-op function instead of null
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const noop = (_value: boolean) => { /* empty function */ };
      setSidebarHandler(noop);
    };
  }, [setIsOpen]);

  // Refresh threads when the sidebar is opened or when mindmap data changes
  useEffect(() => {
    // Only fetch if the user is authenticated and the sidebar is open
    if (isAuthenticated && isOpen) {
      fetchThreads();
    }
  }, [isOpen, isAuthenticated, fetchThreads]);

  // Check for mindmap data changes to trigger a refresh
  // This will ensure new mindmaps appear immediately
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // If sidebar is open and we have mindmap data, wait a bit and then refresh
    // The slight delay ensures the backend has time to save the data
    if (isAuthenticated && isOpen && mindmapData) {
      timeoutId = setTimeout(() => {
        fetchThreads();
      }, 1000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mindmapData, isAuthenticated, isOpen, fetchThreads]);

  // Close sidebar by default and on mobile
  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    
    // Check on mount
    checkSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [setIsOpen]);

  // Calculate dynamic display limit based on screen height
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      // Estimate: each mindmap item is approximately 60px tall
      const availableHeight = window.innerHeight - 150; // Subtract header height and padding
      const estimatedItemsPerScreen = Math.max(6, Math.floor(availableHeight / 60));
      
      // Set initial limit to fit the screen plus a few more
      setDisplayLimit(estimatedItemsPerScreen + 4);
    }
  }, [isOpen]);

  // Function to increase the display limit when user scrolls down
  const loadMoreThreads = useCallback(() => {
    if (!hasMoreThreads || isLoadingMore) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay to prevent rapid increases
    setTimeout(() => {
      setDisplayLimit(prevLimit => prevLimit + 8);
      setIsLoadingMore(false);
    }, 300);
  }, [hasMoreThreads, isLoadingMore]);

  // Setup intersection observer for infinite scrolling with improved detection
  useEffect(() => {
    if (!loaderRef.current || !isOpen) return;
    
    // Store ref value in a variable to prevent issues in cleanup function
    const loaderElement = loaderRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreThreads) {
          console.log("Loading more threads - intersection detected");
          loadMoreThreads();
        }
      },
      { 
        threshold: 0.1, // Lower threshold to detect earlier
        rootMargin: "100px" // Start loading when within 100px
      }
    );

    observer.observe(loaderElement);
    
    return () => {
      if (loaderElement) {
        observer.unobserve(loaderElement);
      }
    };
  }, [hasMoreThreads, isOpen, loadMoreThreads]);

  // Group threads by date and respect display limit
  useEffect(() => {
    if (!threads.length) {
      setGroupedThreads(emptyGroupedThreads);
      setHasMoreThreads(false);
      return;
    }

    const grouped: GroupedThreads = {
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      older: [],
    };

    // Filter and sort threads
    const filteredThreads = searchQuery 
      ? threads.filter(thread => 
          thread.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : threads;

    // Calculate total threads to display with limit
    let threadCount = 0;
    let totalDisplayed = 0;

    // Group threads by date
    filteredThreads.forEach(thread => {
      threadCount++;
      
      // Skip if we've already reached the display limit
      if (totalDisplayed >= displayLimit && !searchQuery) {
        return;
      }
      
      const date = new Date(thread.updatedAt);
      const now = new Date();
      
      if (isToday(date)) {
        grouped.today.push(thread);
        totalDisplayed++;
      } else if (isYesterday(date)) {
        grouped.yesterday.push(thread);
        totalDisplayed++;
      } else {
        const dayDiff = differenceInDays(now, date);
        if (dayDiff <= 7) {
          grouped.previous7Days.push(thread);
          totalDisplayed++;
        } else if (dayDiff <= 30) {
          grouped.previous30Days.push(thread);
          totalDisplayed++;
        } else {
          grouped.older.push(thread);
          totalDisplayed++;
        }
      }
    });

    // Check if there are more threads to load
    setHasMoreThreads(threadCount > totalDisplayed && !searchQuery);
    setGroupedThreads(grouped);
  }, [threads, searchQuery, displayLimit]);

  // Reset display limit when search query changes or sidebar closes/opens
  useEffect(() => {
    setDisplayLimit(12);
  }, [searchQuery, isOpen]);

  // Periodically check if need to load more threads
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return;
      if (!loaderRef.current) return;
      
      const loaderElement = loaderRef.current;
      
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          fetchThreads();
        }
      });
      
      observer.observe(loaderElement);
      
      return () => {
        // Store loaderRef.current in a variable to avoid the React warning
        const currentLoader = loaderElement;
        if (currentLoader) {
          observer.unobserve(currentLoader);
        }
      };
    };
    
    handleScroll();
  }, [isLoading, fetchThreads]);

  // Don't render anything for unauthenticated users or on the sign-in page
  if (!isAuthenticated || pathname.includes("/signin")) {
    return null;
  }

  const handleThreadClick = async (thread: Thread) => {
    const loadedThread = await loadThread(thread.id);
    if (loadedThread && loadedThread.content) {
      setMindmapData(loadedThread.content);
      setIsOpen(false); // Close sidebar after selecting
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm("Are you sure you want to delete this mindmap?")) {
      await deleteThread(threadId);
    }
  };

  // Format time in a more human-readable way like "3 minutes ago"
  const formatTime = (date: Date) => {
    const now = new Date();
    const minutesDiff = differenceInMinutes(now, date);
    const hoursDiff = differenceInHours(now, date);
    
    if (minutesDiff < 60) {
      return `${minutesDiff} minute${minutesDiff !== 1 ? 's' : ''} ago`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff} hour${hoursDiff !== 1 ? 's' : ''} ago`;
    } else {
      return formatDistanceToNow(date, { addSuffix: false });
    }
  };

  // Function to render each thread item
  const renderThreadItem = (thread: Thread) => (
    <div
      key={thread.id}
      className={cn(
        "w-full py-2 px-3 text-left hover:bg-muted/50 cursor-pointer group transition-colors",
        selectedThread?.id === thread.id && "bg-muted/30"
      )}
      onClick={() => handleThreadClick(thread)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-normal line-clamp-1">{thread.title}</h3>
          <div className="flex items-center text-xs text-muted-foreground/80 mt-0.5">
            <Clock className="mr-1 h-3 w-3 inline" />
            {formatTime(new Date(thread.updatedAt))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive"
          onClick={(e) => handleDeleteThread(e, thread.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  // Function to render a date group with its threads
  const renderDateGroup = (title: string, threads: Thread[]) => {
    if (threads.length === 0) return null;
    
    return (
      <div className="mb-2">
        <h2 className="px-3 mb-1 text-xs font-medium uppercase text-muted-foreground/70">
          {title}
        </h2>
        <div>
          {threads.map(renderThreadItem)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Dark overlay for mobile only */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed top-0 left-0 h-full z-40 py-5 border-r border-border/30 bg-background transition-all duration-300 ease-in-out",
          isOpen ? "w-[260px]" : "w-0 overflow-hidden",
          "md:top-16"
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-border/20 w-[260px]">
          <h2 className="text-base font-medium">Your Mindmaps</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground h-7 w-7"
          >
            <SidebarCloseIcon className="h-4 w-4" />
          </Button>
        </div>
          
        <div className="p-3 pb-1 w-[260px]">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search mindmaps..."
              className="pl-8 py-1 h-8 text-sm bg-muted/30"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="relative h-[calc(100%-6rem)] w-[260px]">
          <ScrollArea className="h-full w-full">
            <div className="py-2" ref={scrollAreaRef}>
              {isLoading ? (
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-3 mb-2">
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </>
              ) : Object.values(groupedThreads).every(group => group.length === 0) ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground p-4 mt-16">
                  <FileText className="mb-2 h-8 w-8 opacity-30" />
                  <p>No saved mindmaps yet</p>
                  <p className="mt-1 text-xs">
                    Generate a mindmap to see it here
                  </p>
                </div>
              ) : (
                <>
                  {renderDateGroup("Today", groupedThreads.today)}
                  {renderDateGroup("Yesterday", groupedThreads.yesterday)}
                  {renderDateGroup("Previous 7 Days", groupedThreads.previous7Days)}
                  {renderDateGroup("Previous 30 Days", groupedThreads.previous30Days)}
                  {renderDateGroup("Older", groupedThreads.older)}
                  
                  {/* Loading indicator for more threads */}
                  {hasMoreThreads && (
                    <div 
                      ref={loaderRef} 
                      className="py-4 flex justify-center"
                    >
                      {isLoadingMore ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 bg-primary/20 animate-pulse rounded-full"></div>
                          <div className="h-3 w-3 bg-primary/40 animate-pulse rounded-full" style={{ animationDelay: "200ms" }}></div>
                          <div className="h-3 w-3 bg-primary/60 animate-pulse rounded-full" style={{ animationDelay: "400ms" }}></div>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={loadMoreThreads}
                          className="text-xs text-muted-foreground/70 hover:text-foreground h-7 mt-1 mb-2 flex items-center"
                        >
                          <span>More mindmaps</span>
                          <ChevronDown className="ml-1 h-3 w-3 animate-bounce" />
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
          
          {/* Fade out effect at the bottom when there are more threads */}
          {hasMoreThreads && !isLoadingMore && (
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background to-transparent"></div>
          )}
        </div>
      </div>
    </>
  );
} 