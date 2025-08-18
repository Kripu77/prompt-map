"use client";

import { useState, useCallback } from 'react';
import type { MindmapGenerationOptions } from '@/lib/api/services/core/mindmap-service';
import type { MindmapMode } from '@/lib/types/settings';

// Map MindmapMode to MindmapGenerationOptions format
const mapModeToFormat = (mode: MindmapMode): MindmapGenerationOptions['format'] => {
  switch (mode) {
    case 'comprehensive':
      return 'academic';
    case 'lite':
      return 'practical';
    default:
      return 'practical';
  }
};

export interface UsePromptHandlingProps {
  onSubmit: (prompt: string, options?: MindmapGenerationOptions) => void;
  onTopicShift: () => void;
  currentTitle?: string;
}

export interface UsePromptHandlingReturn {
  isFollowUpMode: boolean;
  promptHistory: string[];
  handlePromptSubmit: (prompt: string, options?: MindmapGenerationOptions) => Promise<{ topicShift?: boolean; detectedTopic?: string }>;
  handleTopicShift: () => void;
  continueWithCurrentTopic: () => void;
}

export function usePromptHandling({
  onSubmit,
  onTopicShift,
  currentTitle,
}: UsePromptHandlingProps): UsePromptHandlingReturn {
  const [isFollowUpMode, setIsFollowUpMode] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const handlePromptSubmit = useCallback(async (prompt: string, options?: MindmapGenerationOptions) => {
    // Simple topic shift detection - check if the prompt is significantly different from current title
    const isTopicShift = currentTitle && 
      !prompt.toLowerCase().includes(currentTitle.toLowerCase().split(' ')[0]) &&
      promptHistory.length === 0;

    if (isTopicShift) {
      return {
        topicShift: true,
        detectedTopic: prompt.split(' ').slice(0, 3).join(' ') + '...'
      };
    }

    // Update prompt history
    setPromptHistory(prev => [...prev, prompt]);
    
    // Determine if this is follow-up mode
    const isFollowUp = promptHistory.length > 0;
    setIsFollowUpMode(isFollowUp);

    // Call the submit handler with provided options or defaults
    onSubmit(prompt, options || {
      useChainOfThought: true,
      format: 'practical',
    });

    return {};
  }, [currentTitle, promptHistory, onSubmit]);

  const handleTopicShift = useCallback(() => {
    setPromptHistory([]);
    setIsFollowUpMode(false);
    onTopicShift();
  }, [onTopicShift]);

  const continueWithCurrentTopic = useCallback(() => {
    // Continue with current topic - no special handling needed
  }, []);

  return {
    isFollowUpMode,
    promptHistory,
    handlePromptSubmit,
    handleTopicShift,
    continueWithCurrentTopic,
  };
}