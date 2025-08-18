"use client";

import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useState, useRef } from 'react';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useReasoningPanelStore } from '@/lib/stores/reasoning-panel-store';
import { useThreads } from '@/hooks/use-threads';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAnonymousAnalytics } from '@/hooks/use-anonymous-analytics';
import { extractMindmapTitle } from '@/lib/utils';
import { toast } from 'sonner';
import type { MindmapGenerationOptions } from '@/lib/api/services/core/mindmap-service';
import type { UIMessage } from 'ai';

export interface MindmapUIMessage extends UIMessage {
  metadata?: {
    topic?: string;
    sources?: Array<{
      title?: string;
      url: string;
      description?: string;
    }>;
    reasoning?: string;
    progress?: {
      wordCount: number;
      estimatedProgress: number;
    };
  };
}

export interface AISdkMindmapState {
  messages: MindmapUIMessage[];
  streamingContent: string;
  reasoningContent: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
  progress: {
    wordCount: number;
    estimatedProgress: number;
  };
  toolCalls: Array<{
    id: string;
    type: string;
    state: 'pending' | 'running' | 'completed' | 'error';
    input: any;
    output?: any;
    errorText?: string;
  }>;
  sources: Array<{
    title?: string;
    url: string;
    description?: string;
  }>;
}

export interface AISdkMindmapActions {
  generateMindmap: (prompt: string, options?: MindmapGenerationOptions) => void;
  generateFollowUp: (prompt: string, context?: any) => void;
  stopGeneration: () => void;
  resetStream: () => void;
}

export type UseAISdkMindmapReturn = AISdkMindmapState & AISdkMindmapActions;

export function useAISdkMindmap(): UseAISdkMindmapReturn {
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
  
  const [toolCalls, setToolCalls] = useState<AISdkMindmapState['toolCalls']>([]);
  const [sources, setSources] = useState<AISdkMindmapState['sources']>([]);
  const [reasoningContent, setLocalReasoningContent] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [progress, setProgress] = useState({
    wordCount: 0,
    estimatedProgress: 0,
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    error,
    stop,
    reload,
    setMessages,
  } = useChat({
    api: '/api/mindmap/stream',
    onToolCall: ({ toolCall }) => {
      // Handle tool call initiation
      setToolCalls(prev => {
        const existing = prev.find(tc => tc.id === toolCall.toolCallId);
        if (existing) {
          return prev.map(tc => 
            tc.id === toolCall.toolCallId 
              ? { ...tc, state: 'running', input: toolCall.args }
              : tc
          );
        }
        return [...prev, {
          id: toolCall.toolCallId,
          type: toolCall.toolName,
          state: 'pending',
          input: toolCall.args,
        }];
      });
    },
    onFinish: (message) => {
      // Handle completion
      setStoreLoading(false);
      setStreaming(false);
      
      // Extract final content for mindmap
      const finalContent = message.content;
      if (typeof finalContent === 'string' && finalContent.trim()) {
        handleCompletionTasks(finalContent, currentPrompt);
      }
      
      // Mark all tool calls as completed
      setToolCalls(prev => prev.map(tc => ({ ...tc, state: 'completed' as const })));
      
      hideAfterGeneration();
    },
    onError: (error) => {
      console.error('AI SDK Mindmap Error:', error);
      setStoreError(error.message);
      setStoreLoading(false);
      setStreaming(false);
      
      // Mark tool calls as errored
      setToolCalls(prev => prev.map(tc => ({ 
        ...tc, 
        state: 'error' as const,
        errorText: error.message 
      })));
      
      hideAfterGeneration();
    },
  });

  // Extract streaming content and reasoning from the latest message
  const streamingContent = messages.length > 0 
    ? (typeof messages[messages.length - 1]?.content === 'string' 
        ? messages[messages.length - 1].content 
        : '')
    : '';

  // Extract reasoning content from message parts or annotations
  const extractReasoningContent = useCallback((latestMessage: any) => {
    // Check for reasoning in message parts (new AI SDK format)
    if (latestMessage.parts) {
      const reasoningPart = latestMessage.parts.find((part: any) => part.type === 'reasoning');
      if (reasoningPart) {
        return reasoningPart.reasoning;
      }
    }
    
    // Check for reasoning in experimental_providerMetadata (fallback)
    if (latestMessage.experimental_providerMetadata?.deepseek?.reasoning) {
      return latestMessage.experimental_providerMetadata.deepseek.reasoning;
    }
    
    // Check for reasoning in annotations (another fallback)
    if (latestMessage.annotations) {
      const reasoningAnnotation = latestMessage.annotations.find((ann: any) => ann.type === 'reasoning');
      if (reasoningAnnotation) {
        return reasoningAnnotation.content;
      }
    }
    
    return null;
  }, []);

  // Update progress as content streams - throttled to prevent excessive updates
  const updateProgress = useCallback((content: string) => {
    if (content) {
      const wordCount = content.split(/\s+/).filter((word: string) => word.length > 0).length;
      const estimatedProgress = Math.min((wordCount / 200) * 100, 95);
      
      setProgress(prev => {
        // Only update if there's a meaningful change (at least 1% or 5 words)
        if (Math.abs(prev.estimatedProgress - estimatedProgress) >= 1 || 
            Math.abs(prev.wordCount - wordCount) >= 5) {
          return {
            wordCount,
            estimatedProgress,
          };
        }
        return prev;
      });
    }
  }, []);

  // Throttled reasoning content update to prevent excessive re-renders
  const lastReasoningUpdateRef = useRef<number>(0);
  const lastReasoningContentRef = useRef<string>('');
  const updateReasoningContent = useCallback((newReasoning: string) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastReasoningUpdateRef.current;
    
    // Only update if enough time has passed (100ms throttle) or if content is significantly different
    if (timeSinceLastUpdate >= 100 || 
        Math.abs(newReasoning.length - lastReasoningContentRef.current.length) > 50) {
      setLocalReasoningContent(newReasoning);
      setReasoningContent(newReasoning);
      lastReasoningUpdateRef.current = now;
      lastReasoningContentRef.current = newReasoning;
    }
  }, [setReasoningContent]);

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1] as any;
      const reasoning = extractReasoningContent(latestMessage);
      
      if (reasoning && reasoning !== lastReasoningContentRef.current) {
        updateReasoningContent(reasoning);
      }
    }
  }, [messages, extractReasoningContent, updateReasoningContent]); // Fixed dependency array

  // Handle streaming reasoning content updates
  useEffect(() => {
    if (isLoading && messages.length > 0) {
      const latestMessage = messages[messages.length - 1] as any;
      const streamingReasoning = extractReasoningContent(latestMessage);
      
      if (streamingReasoning && streamingReasoning !== lastReasoningContentRef.current) {
        updateReasoningContent(streamingReasoning);
      }
    }
  }, [messages, isLoading, extractReasoningContent, updateReasoningContent]); // Fixed dependency array

  useEffect(() => {
    updateProgress(streamingContent);
  }, [streamingContent, updateProgress]);

  // Handle tool call results and extract sources - optimized to prevent excessive re-renders
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Only process the latest message to avoid re-processing all messages
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.toolInvocations) {
      latestMessage.toolInvocations.forEach(invocation => {
        if ('result' in invocation && invocation.toolName === 'webSearchTool') {
          // Extract sources from web search results
          const searchResults = (invocation as any).result?.results || [];
          const newSources = searchResults.map((result: any) => ({
            title: result.title,
            url: result.url,
            description: result.snippet,
          }));
          setSources(prev => {
             // Prevent duplicate sources
             const existingUrls = new Set(prev.map(s => s.url));
             const uniqueNewSources = newSources.filter((s: { url: string }) => !existingUrls.has(s.url));
             return uniqueNewSources.length > 0 ? [...prev, ...uniqueNewSources] : prev;
           });
        }
        
        // Update tool call state
        setToolCalls(prev => prev.map(tc => 
          tc.id === invocation.toolCallId
            ? {
                ...tc,
                state: 'result' in invocation ? 'completed' : 'error',
                output: 'result' in invocation ? (invocation as any).result : undefined,
                errorText: invocation.state === 'call' ? undefined : 'Tool execution failed',
              }
            : tc
        ));
      });
    }
  }, [messages.length]); // Only depend on messages.length to avoid processing same messages multiple times

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
      const title = extractMindmapTitle(completedContent) || 'Untitled Mindmap';
      
      setMindmapData(completedContent);

        if (isAuthenticated && session?.user?.id) {
          await createThread(title, completedContent, undefined, undefined);
          showLoginNotification(true);
        } else {
          recordAnonymousMindmap(currentPrompt, completedContent, title);
          showLoginNotification(false);
        }
    } catch (error) {
      console.error('Error in completion tasks:', error);
      setStoreError('Failed to save mindmap');
    }
  }, [isAuthenticated, session, createThread, setMindmapData, sources, showLoginNotification, recordAnonymousMindmap, setStoreError]);

  const generateMindmap = useCallback(async (prompt: string, options?: MindmapGenerationOptions) => {
    
    // Reset state
    setMessages([]);
    setToolCalls([]);
    setSources([]);
    setLocalReasoningContent('');
    clearReasoning();
    setStoreError(null);
    setCurrentPrompt(prompt);
    
    // Don't auto-show reasoning panel - let user control visibility
    setCurrentTopic(prompt);
    setStreaming(true);
    setStoreLoading(true);
    
    try {
      console.log('Calling append with prompt:', prompt);
      await append({
        role: 'user',
        content: prompt,
        data: options as any
      });
    } catch (error) {
      console.error('Error in append:', error);
      setStoreError('Failed to generate mindmap');
      setStoreLoading(false);
      setStreaming(false);
    }
  }, [append, setMessages, setStoreLoading, setStoreError, setCurrentTopic, setStreaming, clearReasoning]);

  const generateFollowUp = useCallback((prompt: string, context?: any) => {
    setStoreError(null);
    // Don't auto-show reasoning panel - let user control visibility
    setCurrentTopic(prompt);
    setStreaming(true);
    setStoreLoading(true);
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: prompt,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const formEvent = new Event('submit') as any;
    handleSubmit(formEvent, {
      data: {
        prompt: prompt,
        context,
      } as any
    });
  }, [handleSubmit, setMessages, setStoreLoading, setStoreError, setCurrentTopic, setStreaming]);

  const stopGeneration = useCallback(() => {
    stop();
    setStoreLoading(false);
    setStreaming(false);
    hideAfterGeneration();
  }, [stop, setStoreLoading, setStreaming, hideAfterGeneration]);

  const resetStream = useCallback(() => {
    setMessages([]);
    setToolCalls([]);
    setSources([]);
    setLocalReasoningContent('');
    clearReasoning();
    setStoreError(null);
    setStoreLoading(false);
    setStreaming(false);
  }, [setMessages, clearReasoning, setStoreError, setStoreLoading, setStreaming]);

  return {
    messages,
    streamingContent,
    reasoningContent: reasoningContent,
    isStreaming: isLoading,
    isComplete: !isLoading && messages.length > 0,
    error: error?.message || null,
    progress,
    toolCalls,
    sources,
    generateMindmap,
    generateFollowUp,
    stopGeneration,
    resetStream,
  };
}