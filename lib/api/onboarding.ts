// lib/api/onboarding.ts
import { OnboardingState } from '@/hooks/use-onboarding-state';

// Function to fetch onboarding state
export async function fetchOnboardingStateAPI(
  userId?: string, 
  localState?: OnboardingState
): Promise<OnboardingState> {
  // For anonymous users, return the localStorage state
  if (!userId) {
    return localState!;
  }
  
  // For authenticated users, fetch from API
  try {
    const response = await fetch('/api/user/onboarding');
    
    if (!response.ok) {
      console.warn('Failed to fetch onboarding state from API, using localStorage instead');
      return localState!;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to load onboarding state:', error);
    return localState!;
  }
}

// Function to update onboarding state
export async function updateOnboardingStateAPI({ 
  userId, 
  updates, 
  currentState, 
  setLocalState 
}: { 
  userId?: string;
  updates: Partial<OnboardingState>;
  currentState: OnboardingState;
  setLocalState: (state: OnboardingState) => void;
}): Promise<OnboardingState> {
  const newState = { ...currentState, ...updates };
  
  // For anonymous users, just update localStorage
  if (!userId) {
    setLocalState(newState);
    return newState;
  }
  
  // For authenticated users, save to the database via API
  const response = await fetch('/api/user/onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newState),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save onboarding state to database');
  }
  
  // Return the server response
  return await response.json();
}