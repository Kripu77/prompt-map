"use client"

import { useState, useEffect, useCallback } from 'react'
import { useLocalStorage } from './use-local-storage'
import { toast } from 'sonner'

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
  // We'll use localStorage for anonymous users and the database for logged-in users
  const [localState, setLocalState] = useLocalStorage<OnboardingState>('onboarding-state', defaultOnboardingState)
  const [isLoading, setIsLoading] = useState(true)
  const [state, setState] = useState<OnboardingState>(defaultOnboardingState)

  // Load the state from database or localStorage
  const loadState = useCallback(async () => {
    setIsLoading(true)
    try {
      // For authenticated users, fetch from the API/database
      if (userId) {
        const response = await fetch('/api/user/onboarding')
        
        // If the API request fails, fall back to localStorage
        if (!response.ok) {
          console.warn('Failed to fetch onboarding state from API, using localStorage instead')
          setState(localState)
          return
        }
        
        const data = await response.json()
        setState(data)
      } else {
        // For anonymous users, use localStorage
        setState(localState)
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error)
      // Fallback to defaults on error
      setState(localState)
    } finally {
      setIsLoading(false)
    }
  }, [localState, userId])

  // Initialize on mount and when userId changes
  useEffect(() => {
    loadState()
  }, [loadState, userId])

  // Update state in storage (either API or localStorage)
  const updateState = useCallback(async (updates: Partial<OnboardingState>) => {
    const newState = { ...state, ...updates }
    
    // Update local state immediately for responsive UI
    setState(newState)
    
    try {
      // For authenticated users, save to the database via API
      if (userId) {
        const response = await fetch('/api/user/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newState),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save onboarding state to database')
        }
        
        // Update local copy with server response (in case of any changes)
        const data = await response.json()
        setState(data)
      } else {
        // For anonymous users, use localStorage
        setLocalState(newState)
      }
    } catch (error) {
      console.error('Failed to save onboarding state:', error)
      toast.error('Failed to save your progress. Some features may not work properly.')
    }
  }, [state, setLocalState, userId])

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