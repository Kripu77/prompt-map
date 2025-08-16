"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useThreads } from "@/hooks/use-threads";
import type { Thread } from "@/types/api";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { Skeleton } from "../../ui/skeleton";
import {
  FileText,
  Trash2,
  Clock,
  Search,
  ChevronDown,
  Brain,
} from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, differenceInDays, differenceInMinutes, differenceInHours } from "date-fns";
import { useMindmapStore } from "@/lib/stores/mindmap-store";
import { useReasoningPanelStore } from "@/lib/stores/reasoning-panel-store";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { useThreadsStore } from "@/lib/stores/threads-store";
import { usePathname } from "next/navigation";
import { Input } from "../../ui/input";
import { setSidebarHandler } from "../../layout/header";



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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef<boolean>(false);
  const { 
    threads, 
    isLoading, 
    isLoadingMore, 
    hasMore, 
    selectedThread, 
    loadThread, 
    deleteThread, 
    fetchThreads, 
    loadMoreThreads 
  } = useThreads(debouncedSearchQuery);
  const { isOpen, setIsOpen } = useSidebarStore();
  const { mindmapData, setMindmapData, setPrompt, setIsLoading, setError } = useMindmapStore();
  const { setReasoningContent, showForSavedThread } = useReasoningPanelStore();
  const { setCurrentThread } = useThreadsStore();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const pathname = usePathname();

  useEffect(() => {
    setSidebarHandler(setIsOpen);
    return () => {
      const noop = () => { /* empty function */ };
      setSidebarHandler(noop);
    };
  }, [setIsOpen]);


  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (isAuthenticated && isOpen && !isLoading) {
      if (threads.length === 0 || !hasFetchedRef.current) {
        fetchThreads();
        hasFetchedRef.current = true;
      }
    }
  }, [isOpen, isAuthenticated, fetchThreads, threads.length, isLoading]);


  useEffect(() => {
    if (status === 'unauthenticated') {
      hasFetchedRef.current = false;
    }
  }, [status]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isAuthenticated && isOpen && mindmapData) {

      hasFetchedRef.current = false;
      
      timeoutId = setTimeout(() => {
        fetchThreads();
      }, 1000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mindmapData, isAuthenticated, isOpen, fetchThreads]);



  useEffect(() => {
    const checkSize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    

    checkSize();
    
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [setIsOpen]);


  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!loaderRef.current || !isOpen || !hasMore) return;
    
    const loaderElement = loaderRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          console.log("Loading more threads - intersection detected");
          loadMoreThreads();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "100px"
      }
    );

    observer.observe(loaderElement);
    
    return () => {
      if (loaderElement) {
        observer.unobserve(loaderElement);
      }
    };
  }, [hasMore, isOpen, loadMoreThreads, isLoadingMore]);

  // Group threads by date (server-side pagination handles filtering)
  const groupedThreads = useMemo(() => {
    if (!threads.length) {
      return emptyGroupedThreads;
    }

    const grouped: GroupedThreads = {
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      older: [],
    };

    // Group all threads by date (no client-side filtering needed)
    threads.forEach(thread => {
      const date = new Date(thread.updatedAt);
      const now = new Date();
      
      if (isToday(date)) {
        grouped.today.push(thread);
      } else if (isYesterday(date)) {
        grouped.yesterday.push(thread);
      } else {
        const dayDiff = differenceInDays(now, date);
        if (dayDiff <= 7) {
          grouped.previous7Days.push(thread);
        } else if (dayDiff <= 30) {
          grouped.previous30Days.push(thread);
        } else {
          grouped.older.push(thread);
        }
      }
    });

    return grouped;
  }, [threads]);

  // Don't render anything for unauthenticated users or on the sign-in page
  if (!isAuthenticated || pathname.includes("/signin")) {
    return null;
  }

  const handleThreadClick = async (thread: Thread) => {

    try {
      const loadedThread = await loadThread(thread.id);
      if (loadedThread && loadedThread.content) {
        // Set the current thread in the threads store FIRST
        setCurrentThread(loadedThread);
        
        // Then update the mindmap data
        setMindmapData(loadedThread.content);
        setPrompt(loadedThread.title);
        setIsLoading(false);
        setError(null);
        setIsOpen(false);
        
        // Restore reasoning data if available (but don't auto-open panel)
        if (loadedThread.reasoning) {
          console.log('Loading thread with reasoning duration:', loadedThread.reasoningDuration);
          setReasoningContent(loadedThread.reasoning, loadedThread.reasoningDuration);
        } else {
          setReasoningContent('', undefined);
        }
        
        console.log('Thread loaded successfully:', loadedThread.title);
      }
    } catch (error) {
      console.error('Error loading thread:', error);
      setError('Failed to load mindmap');
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm("Are you sure you want to delete this mindmap?")) {
      await deleteThread(threadId);
    }
  };


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


  const renderThreadItem = (thread: Thread) => (
    <div
      key={thread.id}
      className={cn(

        "w-full py-2 px-3 text-left hover:bg-muted/50 cursor-pointer group transition-colors relative",

        selectedThread?.id === thread.id && "bg-muted/30"
      )}
      onClick={() => handleThreadClick(thread)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-normal line-clamp-1 flex-1">{thread.title}</h3>
            {thread.reasoning && (
              <div className="relative group/tooltip">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 border border-primary/20 animate-pulse hover:animate-none transition-all duration-3000 hover:bg-primary/20 hover:scale-110">
                  <Brain className="h-3 w-3 text-primary" />
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover border border-border rounded-md shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                  <div className="text-xs font-medium text-popover-foreground">
                    💭 View AI Thinking
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-border"></div>
                </div>
              </div>
            )}
          </div>
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
                  
                  {hasMore && (
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
          
          {hasMore && !isLoadingMore && (
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background to-transparent"></div>
          )}
        </div>
      </div>
    </>
  );
}