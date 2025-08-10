
import { useState, useCallback } from 'react';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useThreads } from '@/hooks/use-threads';
import { useThreadsStore } from '@/lib/stores/threads-store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAnonymousAnalytics } from '@/hooks/use-anonymous-analytics';
import { useCheckTopicShift, useGenerateMindmap } from '@/lib/api/mindmap';
import { extractMindmapTitle } from '@/lib/utils';
import { toast } from 'sonner';
import type { PromptHistoryItem } from '@/types/store';


interface MindmapGenerationState {
  error: string | null;
  promptHistory: PromptHistoryItem[];
  isFollowUpMode: boolean;
  isUserGenerated: boolean;
  topicShiftDetected: boolean;
  pendingPrompt: string | null;
}

interface MindmapGenerationActions {
  processPrompt: (value: string, isFollowUp: boolean) => Promise<void>;
  handleTopicShift: () => void;
  continueDespiteShift: () => void;
  resetState: () => void;
}

export type UseMindmapGenerationReturn = MindmapGenerationState & MindmapGenerationActions;


export function useMindmapGeneration(): UseMindmapGenerationReturn {

  const { 
    isLoading, setIsLoading, 
    mindmapData, setMindmapData,
    prompt, setPrompt
  } = useMindmapStore();
  
  const { createThread, isAuthenticated } = useThreads();
  const { setCurrentThread } = useThreadsStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { recordAnonymousMindmap } = useAnonymousAnalytics();
  
  // API mutations
  const topicShiftMutation = useCheckTopicShift();
  const mindmapMutation = useGenerateMindmap();
  
  // Local state
  const [error, setError] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [isFollowUpMode, setIsFollowUpMode] = useState<boolean>(false);
  const [isUserGenerated, setIsUserGenerated] = useState<boolean>(false);
  const [topicShiftDetected, setTopicShiftDetected] = useState<boolean>(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);


  const generatePromptPayload = useCallback((newPrompt: string, isFollowUp: boolean, checkTopicShift: boolean = false) => {
    if (!isFollowUp) {
      return { prompt: newPrompt };
    }
    
    const initialPrompt = promptHistory.find(p => !p.isFollowUp)?.prompt || prompt;
    
    return { 
      prompt: newPrompt,
      context: {
        originalPrompt: initialPrompt,
        existingMindmap: mindmapData,
        previousPrompts: promptHistory.map(p => p.prompt),
        isFollowUp: true,
        checkTopicShift
      }
    };
  }, [promptHistory, prompt, mindmapData]);

  const showLoginNotification = useCallback((isSuccess: boolean = false) => {
    if (isAuthenticated || status === "loading") return;
    
    const message = isSuccess 
      ? "Mindmap created successfully! 🚀 Sign in to save your mindmap for future access."
      : "Your mindmap isn't saved. Sign in to keep your ideas safe and access them anytime.";
    
    toast(message, {
      duration: 8000,
      action: {
        label: "Sign in",
        onClick: () => router.push('/signin')
      }
    });
  }, [isAuthenticated, status, router]);


  const processPrompt = useCallback(async (value: string, isFollowUp: boolean) => {
    setIsLoading(true);
    setError(null);
    
    // Add to prompt history
    const newPromptItem: PromptHistoryItem = {
      prompt: value,
      timestamp: Date.now(),
      isFollowUp: isFollowUp
    };
    
    setPromptHistory(prev => [...prev, newPromptItem]);
    setPrompt(value);
    
    try {
      // Check for topic shift if this is a follow-up
      if (isFollowUp && isUserGenerated) {
        const shiftCheckPayload = generatePromptPayload(value, true, true);
        const result = await topicShiftMutation.mutateAsync(shiftCheckPayload);
        
        if (result.isTopicShift) {
          setPendingPrompt(value);
          setTopicShiftDetected(true);
          setIsLoading(false);
          return;
        }
      }
      
      // Generate mindmap
      const payload = generatePromptPayload(value, isFollowUp);
      const data = await mindmapMutation.mutateAsync(payload);
      
      if (data.content && typeof data.content === 'string') {
        setMindmapData(data.content);
        setIsUserGenerated(true);
        setIsFollowUpMode(true);
        

        if (!isAuthenticated && data.content.trim()) {
          recordAnonymousMindmap(
            value, 
            data.content, 
            extractMindmapTitle(data.content) || value
          );
          showLoginNotification(true);
        }
        
        // Auto-save for authenticated users
        if (isAuthenticated) {
          try {
            const title = extractMindmapTitle(data.content) || value;
            const createdThread = await createThread(title, data.content);
            if (createdThread) {
              setCurrentThread(createdThread);
            }
          } catch (error) {
            console.error('Error auto-saving mindmap:', error);
          }
        }
      } else {
        setError('Invalid mindmap data received');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [
    setIsLoading, setError, setPrompt, setMindmapData,
    isUserGenerated, generatePromptPayload, topicShiftMutation,
    mindmapMutation, isAuthenticated, recordAnonymousMindmap,
    showLoginNotification, createThread, setCurrentThread
  ]);

  const handleTopicShift = useCallback(() => {
    setTopicShiftDetected(false);
    
    if (pendingPrompt) {
      setIsFollowUpMode(false);
      setPromptHistory([]);
      processPrompt(pendingPrompt, false);
      setPendingPrompt(null);
    }
  }, [pendingPrompt, processPrompt]);

  const continueDespiteShift = useCallback(() => {
    setTopicShiftDetected(false);
    
    if (pendingPrompt) {
      processPrompt(pendingPrompt, true);
      setPendingPrompt(null);
    }
  }, [pendingPrompt, processPrompt]);

  const resetState = useCallback(() => {
    setError(null);
    setPromptHistory([]);
    setIsFollowUpMode(false);
    setIsUserGenerated(false);
    setTopicShiftDetected(false);
    setPendingPrompt(null);
  }, []);

  return {
    // State
    error,
    promptHistory,
    isFollowUpMode,
    isUserGenerated,
    topicShiftDetected,
    pendingPrompt,
    
    // Actions
    processPrompt,
    handleTopicShift,
    continueDespiteShift,
    resetState,
  };
}