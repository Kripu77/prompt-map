"use client";

import { useCallback, useState, useEffect, useRef } from 'react';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useReasoningPanelStore } from '@/lib/stores/reasoning-panel-store';
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
  reasoningContent: string;
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
  const { 
    setReasoningContent,
    appendReasoningContent,
    setStreaming,
    setCurrentTopic,
    clearReasoning,
    showForGeneration,
    hideAfterGeneration
  } = useReasoningPanelStore();
  const { createThread, isAuthenticated } = useThreads();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { recordAnonymousMindmap } = useAnonymousAnalytics();
  
  // Streaming state
  const [completion, setCompletion] = useState('');
  const [reasoning, setReasoning] = useState('');
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

  const handleCompletionTasks = useCallback(async (completedContent: string, currentPrompt: string, reasoningData?: string) => {
    try {
      console.log('handleCompletionTasks called with:', {
        contentLength: completedContent?.length || 0,
        promptLength: currentPrompt?.length || 0,
        reasoningLength: reasoningData?.length || 0,
        hasReasoning: !!reasoningData
      });
      
      // Handle analytics and notifications for non-authenticated users
      if (!isAuthenticated && completedContent && completedContent.trim()) {
        const title = extractMindmapTitle(completedContent) || currentPrompt;
        recordAnonymousMindmap(currentPrompt, completedContent, title);
        showLoginNotification(true);
      }
      
      // Auto-save for authenticated users
      if (isAuthenticated && completedContent && completedContent.trim()) {
        try {
          const title = extractMindmapTitle(completedContent) || currentPrompt;
          console.log('Creating thread with reasoning data:', {
            title,
            contentLength: completedContent.length,
            reasoningLength: reasoningData?.length || 0
          });
          await createThread(title, completedContent, reasoningData);
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
      setReasoning(''); // Clear previous reasoning content
      setIsComplete(false);
      setProgress({ wordCount: 0, estimatedProgress: 0 });
      
      // Initialize reasoning panel
      clearReasoning();
      setCurrentTopic(prompt);
      setStreaming(true);

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
      let accumulatedReasoning = ''; // Track reasoning separately
      
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
                    
                    // Update progress
                    const wordCount = accumulatedContent.split(/\s+/).filter(word => word.length > 0).length;
                    const estimatedProgress = Math.min(Math.round((wordCount / 500) * 100), 95); // Estimate based on ~500 words
                    setProgress({ wordCount, estimatedProgress });
                  }
                } catch (e) {
                  // If it's not JSON, treat as plain text
                  accumulatedContent += textData;
                  setCompletion(accumulatedContent);
                  
                  // Update progress
                  const wordCount = accumulatedContent.split(/\s+/).filter(word => word.length > 0).length;
                  const estimatedProgress = Math.min(Math.round((wordCount / 500) * 100), 95); // Estimate based on ~500 words
                  setProgress({ wordCount, estimatedProgress });
                }
              }
            } else if (line.startsWith('g:')) {
              // Reasoning chunk (AI SDK format)
              const reasoningData = line.slice(2);
              if (reasoningData) {
                try {
                  const parsed = JSON.parse(reasoningData);
                  if (parsed && typeof parsed === 'string') {
                    accumulatedReasoning += parsed;
                    setReasoning(accumulatedReasoning);
                    appendReasoningContent(parsed); // Sync with reasoning panel
                  }
                } catch (e) {
                  // If it's not JSON, treat as plain text
                  accumulatedReasoning += reasoningData;
                  setReasoning(accumulatedReasoning);
                  appendReasoningContent(reasoningData); // Sync with reasoning panel
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
      setStreaming(false); // Stop streaming in reasoning panel
      setMindmapData(accumulatedContent);
      
      // Use the accumulated reasoning content
      await handleCompletionTasks(accumulatedContent, prompt, accumulatedReasoning);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
        setStreaming(false); // Stop streaming in reasoning panel
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
      setStreaming(false); // Stop streaming in reasoning panel
      toast.error(`Failed to generate mindmap: ${errorMessage}`);
    } finally {
        setIsLoading(false);
        setStoreLoading(false);
        setStreaming(false);
        hideAfterGeneration(); // Explicitly hide after generation
        abortControllerRef.current = null;
      }
  }, [setMindmapData, handleCompletionTasks, clearReasoning, setCurrentTopic, setStreaming, appendReasoningContent]);

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
    
    setStreaming(false); // Stop streaming in reasoning panel
    
    // Save partial content if it exists
    if (completion) {
      setMindmapData(completion);
      toast.info('Generation stopped. Partial content saved.');
    }
  }, [completion, setMindmapData, setStreaming]);

  const resetStream = useCallback(() => {
    setCompletion('');
    setReasoning(''); // Clear local reasoning state
    setIsComplete(false);
    setProgress({ wordCount: 0, estimatedProgress: 0 });
    setError(null);
    
    // Clear reasoning panel data
    clearReasoning();
    setStreaming(false);
  }, [clearReasoning, setStreaming]);

  return {
    // State
    streamingContent: completion,
    reasoningContent: reasoning,
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