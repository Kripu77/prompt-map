"use client";

import { AIReasoningPanel } from './ai-reasoning-panel';
import { useReasoningPanelStore } from '@/lib/stores/reasoning-panel-store';

export function AIReasoningPanelWrapper() {
  const { 
    isVisible, 
    reasoningContent, 
    isStreaming, 
    currentTopic, 
    toggleVisibility 
  } = useReasoningPanelStore();

  return (
    <AIReasoningPanel
      reasoningContent={reasoningContent}
      isStreaming={isStreaming}
      isVisible={isVisible}
      onToggleVisibility={toggleVisibility}
      topic={currentTopic}
    />
  );
}