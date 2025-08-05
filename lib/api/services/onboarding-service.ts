import { db } from '@/lib/db';
import { userOnboarding } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { OnboardingState, OnboardingUpdateRequest } from '@/types/api';

export class OnboardingService {
  async getOnboardingState(userId: string): Promise<OnboardingState> {
    try {
      const state = await db.query.userOnboarding.findFirst({
        where: eq(userOnboarding.userId, userId),
      });
      
      if (!state) {
        return {
          currentStep: 0,
          completedSteps: [],
          isCompleted: false,
          hasCompletedOnboarding: false,
          lastUpdated: new Date().toISOString(),
        };
      }
      
      return {
        currentStep: state.lastCompletedStep + 1,
        completedSteps: state.completedSteps || [],
        isCompleted: Boolean(state.hasCompletedOnboarding),
        hasCompletedOnboarding: Boolean(state.hasCompletedOnboarding),
        lastUpdated: state.updatedAt?.toISOString() || state.lastSeenAt?.toISOString() || new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get onboarding state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateOnboardingState(userId: string, data: OnboardingUpdateRequest): Promise<OnboardingState> {
    try {
      const existingState = await db.query.userOnboarding.findFirst({
        where: eq(userOnboarding.userId, userId),
      });
      
      const now = new Date();
      let result;
      
      if (existingState) {
        [result] = await db
          .update(userOnboarding)
          .set({
            hasCompletedOnboarding: data.isCompleted ? 1 : 0,
            lastCompletedStep: data.step ?? existingState.lastCompletedStep,
            completedSteps: data.completedSteps ?? existingState.completedSteps,
            lastSeenAt: now,
            updatedAt: now,
          })
          .where(eq(userOnboarding.userId, userId))
          .returning();
      } else {
        [result] = await db
          .insert(userOnboarding)
          .values({
            userId,
            hasCompletedOnboarding: data.isCompleted ? 1 : 0,
            lastCompletedStep: data.step ?? 0,
            completedSteps: data.completedSteps ?? [],
            lastSeenAt: now,
            onboardingVersion: 1,
          })
          .returning();
      }
      
      return {
        currentStep: result.lastCompletedStep + 1,
        completedSteps: result.completedSteps || [],
        isCompleted: Boolean(result.hasCompletedOnboarding),
        hasCompletedOnboarding: Boolean(result.hasCompletedOnboarding),
        lastUpdated: result.updatedAt?.toISOString() || result.lastSeenAt?.toISOString() || now.toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to update onboarding state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const onboardingService = new OnboardingService();