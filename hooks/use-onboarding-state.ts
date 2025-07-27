"use client"

import { useCallback } from 'react';
import { useLocalStorage } from './use-local-storage';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOnboardingStateAPI, updateOnboardingStateAPI } from '@/lib/api/onboarding';

// Define interface for onboarding state
export interface OnboardingState {
  hasCompletedOnboarding?: boolean;
  lastCompletedStep?: number;
  dismissedAt?: number;
  completedSteps?: string[];
  lastSeenAt?: number;
  onboardingVersion?: number;
  currentStep?: number;
  isCompleted?: boolean;
  lastUpdated?: string;
}

// Default state when a user is completely new
const defaultOnboardingState: OnboardingState = {
  hasCompletedOnboarding: false,
  lastCompletedStep: -1,
  completedSteps: [],
  onboardingVersion: 1,
  currentStep: 0,
  isCompleted: false,
};

/**
 * Custom hook to manage onboarding state with Tanstack Query
 */
export function useOnboardingState(userId?: string) {
  const queryClient = useQueryClient();
  const [localState, setLocalState] = useLocalStorage<OnboardingState>('onboarding-state', defaultOnboardingState);
  
  // Query for fetching onboarding state
  const { 
    data: state = defaultOnboardingState, 
    isLoading 
  } = useQuery({
    queryKey: ['onboardingState', userId],
    queryFn: () => fetchOnboardingStateAPI(userId, localState),
    staleTime: 1000 * 60 * 5, // 5 minutes
    initialData: localState,
  });

  // Mutation for updating onboarding state
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<OnboardingState>) => updateOnboardingStateAPI({
      userId,
      updates,
      currentState: state,
      setLocalState
    }),
    onSuccess: (data) => {
      // Update the query cache with the new state
      queryClient.setQueryData(['onboardingState', userId], data);
    },
    onError: (error) => {
      console.error('Failed to save onboarding state:', error);
      toast.error('Failed to save your progress. Some features may not work properly.');
    }
  });

  // Update state wrapper
  const updateState = useCallback((updates: Partial<OnboardingState>) => {
    updateMutation.mutate(updates);
  }, [updateMutation]);

  // Helper functions (remain mostly unchanged)
  const markStepCompleted = useCallback((stepId: string, stepIndex: number) => {
    const completedSteps = [...(state.completedSteps || [])];
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId);
    }
    
    updateState({
      completedSteps,
      lastCompletedStep: Math.max(state.lastCompletedStep || -1, stepIndex),
      lastSeenAt: Date.now(),
    });
  }, [state, updateState]);

  const completeOnboarding = useCallback(() => {
    updateState({
      hasCompletedOnboarding: true,
      dismissedAt: Date.now(),
      lastSeenAt: Date.now(),
    });
  }, [updateState]);

  const restartOnboarding = useCallback(() => {
    updateState({
      hasCompletedOnboarding: false,
      lastCompletedStep: -1,
      completedSteps: [],
      lastSeenAt: Date.now(),
    });
  }, [updateState]);

  return {
    isLoading,
    state,
    updateState,
    markStepCompleted,
    completeOnboarding,
    restartOnboarding,
  };
}