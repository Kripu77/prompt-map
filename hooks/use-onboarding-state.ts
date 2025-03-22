"use client"

import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'

// Define interface for onboarding state
export interface OnboardingState {
  hasCompletedOnboarding: boolean
  lastCompletedStep: number
  dismissedAt?: number
  completedSteps: string[]
  lastSeenAt?: number
  onboardingVersion: number // For future migrations when onboarding changes
}

// Default state when a user is completely new
const defaultOnboardingState: OnboardingState = {
  hasCompletedOnboarding: false,
  lastCompletedStep: -1,
  completedSteps: [],
  onboardingVersion: 1, // Increment this when you make significant changes to onboarding
}

/**
 * Custom hook to manage onboarding state with an abstraction layer
 * that can be easily switched from localStorage to a database
 */
export function useOnboardingState(userId?: string) {
  // Currently we're using localStorage, but this can be switched to an API call later
  const [localState, setLocalState] = useLocalStorage<OnboardingState>('onboarding-state', defaultOnboardingState)
  const [isLoading, setIsLoading] = useState(true)
  const [state, setState] = useState<OnboardingState>(defaultOnboardingState)

  // Load the state - this function can be modified to fetch from an API instead
  const loadState = useCallback(async () => {
    setIsLoading(true)
    try {
      // When switching to a database, replace this with an API call
      // e.g., if (userId) { const data = await fetchUserOnboardingState(userId) }
      setState(localState)
    } catch (error) {
      console.error('Failed to load onboarding state:', error)
      // Fallback to defaults on error
      setState(defaultOnboardingState)
    } finally {
      setIsLoading(false)
    }
  }, [localState])

  // Initialize on mount
  useEffect(() => {
    loadState()
  }, [loadState])

  // Update state in storage and local state
  const updateState = useCallback(async (updates: Partial<OnboardingState>) => {
    const newState = { ...state, ...updates }
    
    // Update local state immediately for responsive UI
    setState(newState)
    
    try {
      // When switching to a database, replace this with an API call
      // e.g., if (userId) { await updateUserOnboardingState(userId, newState) }
      setLocalState(newState)
    } catch (error) {
      console.error('Failed to save onboarding state:', error)
      // Consider showing a toast or notification about saving issue
    }
  }, [state, setLocalState])

  // Convenient methods for common operations
  const markStepCompleted = useCallback((stepId: string, stepIndex: number) => {
    const completedSteps = [...state.completedSteps]
    if (!completedSteps.includes(stepId)) {
      completedSteps.push(stepId)
    }
    
    updateState({
      completedSteps,
      lastCompletedStep: Math.max(state.lastCompletedStep, stepIndex),
      lastSeenAt: Date.now(),
    })
  }, [state, updateState])

  const completeOnboarding = useCallback(() => {
    updateState({
      hasCompletedOnboarding: true,
      dismissedAt: Date.now(),
      lastSeenAt: Date.now(),
    })
  }, [updateState])

  const restartOnboarding = useCallback(() => {
    updateState({
      hasCompletedOnboarding: false,
      lastCompletedStep: -1,
      completedSteps: [],
      lastSeenAt: Date.now(),
    })
  }, [updateState])

  return {
    isLoading,
    state,
    updateState,
    markStepCompleted,
    completeOnboarding,
    restartOnboarding,
  }
} 