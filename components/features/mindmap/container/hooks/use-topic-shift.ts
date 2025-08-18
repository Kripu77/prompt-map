"use client";

import { useState, useCallback } from 'react';

interface UseTopicShiftProps {
  currentTopic: string;
  onTopicShift: () => void;
}

interface UseTopicShiftReturn {
  isTopicShiftDialogOpen: boolean;
  pendingPrompt: string;
  newTopic: string;
  handleTopicShift: (prompt: string, detectedTopic: string) => void;
  confirmTopicShift: () => void;
  cancelTopicShift: () => void;
}

export function useTopicShift({
  currentTopic,
  onTopicShift,
}: UseTopicShiftProps): UseTopicShiftReturn {
  const [isTopicShiftDialogOpen, setIsTopicShiftDialogOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState('');
  const [newTopic, setNewTopic] = useState('');

  const handleTopicShift = useCallback((prompt: string, detectedTopic: string) => {
    setPendingPrompt(prompt);
    setNewTopic(detectedTopic);
    setIsTopicShiftDialogOpen(true);
  }, []);

  const confirmTopicShift = useCallback(() => {
    setIsTopicShiftDialogOpen(false);
    setPendingPrompt('');
    setNewTopic('');
    onTopicShift();
  }, [onTopicShift]);

  const cancelTopicShift = useCallback(() => {
    setIsTopicShiftDialogOpen(false);
    setPendingPrompt('');
    setNewTopic('');
  }, []);

  return {
    isTopicShiftDialogOpen,
    pendingPrompt,
    newTopic,
    handleTopicShift,
    confirmTopicShift,
    cancelTopicShift,
  };
}