"use client";

import { useCallback, useState, useEffect, useRef } from 'react';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useThreads } from '@/hooks/use-threads';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAnonymousAnalytics } from '@/hooks/use-anonymous-analytics';
import { extractMindmapTitle } from '@/lib/utils';
import { toast } from 'sonner';
import type { PromptPayload } from '@/types/api';
import type { MindmapGenerationOptions } from '@/lib/api/services/mindmap-service';

export interface StreamingMindmapState {
  streamingContent: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  progress: {
    wordCount: number;
    estimatedProgress: number;
  };
}

export interface StreamingMindmapActions {
  generateMindmap: (prompt: string, options?: MindmapGenerationOptions) => void;
  generateFollowUp: (prompt: string, context: PromptPayload['context']) => void;
  stopGeneration: () => void;
  resetStream: () => void;
}

export type UseStreamingMindmapReturn = StreamingMindmapState & StreamingMindmapActions;

export function useStreamingMindmap(): UseStreamingMindmapReturn {
  const { setMindmapData, setIsLoading: setStoreLoading, setError: setStoreError } = useMindmapStore();
  const { createThread, isAuthenticated } = useThreads();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { recordAnonymousMindmap } = useAnonymousAnalytics();
  
  // Streaming state
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState({
    wordCount: 0,
    estimatedProgress: 0,
  });

  // Ref to track the current abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update progress as content streams
  useEffect(() => {
    if (completion) {
      const wordCount = completion.split(/\s+/).filter((word: string) => word.length > 0).length;
      const estimatedProgress = Math.min((wordCount / 200) * 100, 95); // Estimate based on typical mindmap length
      
      setProgress({
        wordCount,
        estimatedProgress,
      });
    }
  }, [completion]);

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

  const handleCompletionTasks = useCallback(async (completedContent: string, currentPrompt: string) => {
    try {
      // Handle analytics and notifications for non-authenticated users
      if (!isAuthenticated) {
        const title = extractMindmapTitle(completedContent) || currentPrompt;
        recordAnonymousMindmap(currentPrompt, completedContent, title);
        showLoginNotification(true);
      }
      
      // Auto-save for authenticated users
      if (isAuthenticated) {
        try {
          const title = extractMindmapTitle(completedContent) || currentPrompt;
          await createThread(title, completedContent);
          toast.success('Mindmap saved successfully!');
        } catch (error) {
          console.error('Error auto-saving mindmap:', error);
          toast.error('Failed to save mindmap');
        }
      }
    } catch (error) {
      console.error('Error in completion tasks:', error);
    }
  }, [isAuthenticated, recordAnonymousMindmap, createThread, showLoginNotification]);

  const streamCompletion = useCallback(async (
    prompt: string, 
    options?: MindmapGenerationOptions, 
    context?: PromptPayload['context']
  ) => {
    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      setError(null);
      setCompletion('');
      setIsComplete(false);
      setProgress({ wordCount: 0, estimatedProgress: 0 });

      const response = await fetch('/api/mindmap/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options,
          context,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          // Ignore parsing errors
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          // Parse AI SDK streaming format
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Text chunk
              const textData = line.slice(2);
              if (textData) {
                try {
                  const parsed = JSON.parse(textData);
                  if (parsed && typeof parsed === 'string') {
                    accumulatedContent += parsed;
                    setCompletion(accumulatedContent);
                  }
                } catch (e) {
                  // If it's not JSON, treat as plain text
                  accumulatedContent += textData;
                  setCompletion(accumulatedContent);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Mark as complete and handle post-completion tasks
      setIsComplete(true);
      setMindmapData(accumulatedContent);
      await handleCompletionTasks(accumulatedContent, prompt);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      
      console.error('Streaming error details:', {
        error,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      const errorMessage = error.message || 'An error occurred during streaming';
      setError(errorMessage);
      toast.error(`Failed to generate mindmap: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [setMindmapData, handleCompletionTasks]);

  const generateMindmap = useCallback(async (prompt: string, options?: MindmapGenerationOptions) => {
    await streamCompletion(prompt, options);
  }, [streamCompletion]);

  const generateFollowUp = useCallback(async (prompt: string, context: PromptPayload['context']) => {
    await streamCompletion(prompt, undefined, context);
  }, [streamCompletion]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Save partial content if it exists
    if (completion) {
      setMindmapData(completion);
      toast.info('Generation stopped. Partial content saved.');
    }
  }, [completion, setMindmapData]);

  const resetStream = useCallback(() => {
    setCompletion('');
    setIsComplete(false);
    setProgress({ wordCount: 0, estimatedProgress: 0 });
    setError(null);
  }, []);

  return {
    // State
    streamingContent: completion,
    isStreaming: isLoading,
    isComplete,
    error,
    progress,
    
    // Actions
    generateMindmap,
    generateFollowUp,
    stopGeneration,
    resetStream,
  };
}