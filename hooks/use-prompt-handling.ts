"use client";

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useSidebarStore } from '@/lib/stores/sidebar-store';
import type { MindmapGenerationOptions } from '@/lib/api/services/core/mindmap-service';

export interface UsePromptHandlingProps {
  generateMindmap: (prompt: string, options?: MindmapGenerationOptions) => void;
  generateFollowUp: (prompt: string, context?: any) => void;
  resetStream: () => void;
  displayContent?: string;
}

export interface UsePromptHandlingReturn {
  isFollowUpMode: boolean;
  promptHistory: string[];
  topicShiftDetected: boolean;
  pendingPrompt: string | null;
  handlePromptSubmit: (value: string) => Promise<void>;
  handleTopicShift: () => void;
  continueDespiteShift: () => void;
  setIsFollowUpMode: (value: boolean) => void;
}

export function usePromptHandling({
  generateMindmap,
  generateFollowUp,
  resetStream,
  displayContent,
}: UsePromptHandlingProps): UsePromptHandlingReturn {
  const { setIsOpen: setSidebarOpen } = useSidebarStore();
  const [isFollowUpMode, setIsFollowUpMode] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [topicShiftDetected, setTopicShiftDetected] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const checkTopicShift = useCallback(async (): Promise<boolean> => {
    if (!displayContent || promptHistory.length === 0) return false;
    return false;
  }, [displayContent, promptHistory]);

  const handlePromptSubmit = useCallback(async (value: string) => {
    try {
      resetStream();
      
      // Auto-close sidebar when content starts streaming
      setSidebarOpen(false);
      
      if (!isFollowUpMode || promptHistory.length === 0) {
        setPromptHistory([value]);
        setIsFollowUpMode(false);
        
        generateMindmap(value, {
          useChainOfThought: true,
          format: 'practical',
        });
      } else {
        const shouldCheckTopicShift = await checkTopicShift();
        
        if (shouldCheckTopicShift) {
          setPendingPrompt(value);
          setTopicShiftDetected(true);
          return;
        }
        
        setPromptHistory(prev => [...prev, value]);
        generateFollowUp(value, {
          originalPrompt: promptHistory[0],
          existingMindmap: displayContent,
          previousPrompts: promptHistory,
          isFollowUp: true,
        });
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error('Failed to process prompt. Please try again.');
    }
  }, [isFollowUpMode, promptHistory, displayContent, resetStream, setSidebarOpen, generateMindmap, generateFollowUp, checkTopicShift]);

  const handleTopicShift = useCallback(() => {
    if (pendingPrompt) {
      setTopicShiftDetected(false);
      setIsFollowUpMode(false);
      setPromptHistory([pendingPrompt]);
      resetStream();
      
      // Auto-close sidebar when content starts streaming
      setSidebarOpen(false);
      
      generateMindmap(pendingPrompt, {
        useChainOfThought: true,
        format: 'practical',
      });
      
      setPendingPrompt(null);
    }
  }, [pendingPrompt, resetStream, setSidebarOpen, generateMindmap]);

  const continueDespiteShift = useCallback(() => {
    if (pendingPrompt) {
      setTopicShiftDetected(false);
      setPromptHistory(prev => [...prev, pendingPrompt]);
      
      // Auto-close sidebar when content starts streaming
      setSidebarOpen(false);
      
      generateFollowUp(pendingPrompt, {
        originalPrompt: promptHistory[0],
        existingMindmap: displayContent,
        previousPrompts: promptHistory,
        isFollowUp: true,
      });
      
      setPendingPrompt(null);
    }
  }, [pendingPrompt, promptHistory, displayContent, setSidebarOpen, generateFollowUp]);

  return {
    isFollowUpMode,
    promptHistory,
    topicShiftDetected,
    pendingPrompt,
    handlePromptSubmit,
    handleTopicShift,
    continueDespiteShift,
    setIsFollowUpMode,
  };
}