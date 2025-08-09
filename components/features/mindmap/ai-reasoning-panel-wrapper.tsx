"use client";

import { AIReasoningPanel } from './ai-reasoning-panel';
import { useReasoningPanelStore } from '@/lib/stores/reasoning-panel-store';
import { useUserSettings } from '@/hooks/use-user-settings';

export function AIReasoningPanelWrapper() {
  const { 
    isVisible, 
    reasoningContent, 
    isStreaming, 
    currentTopic, 
    toggleVisibility 
  } = useReasoningPanelStore();
  const { settings } = useUserSettings();

  if (!isVisible) {
    return null;
  }

  return (
    <AIReasoningPanel
      reasoningContent={reasoningContent}
      isStreaming={isStreaming}
      isVisible={isVisible}
      onToggleVisibility={toggleVisibility}
      topic={currentTopic}
      mode={settings?.mindmapMode}
    />
  );
}