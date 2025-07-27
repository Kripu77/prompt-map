import { NextRequest } from 'next/server';
import { onboardingService } from '@/lib/api/services/onboarding-service';
import {
  validateRequestBody,
  createValidationErrorResponse,
  createErrorResponse,
  createSuccessResponse,
  checkRateLimit,
  getClientIdentifier,
  requireAuth,
  OnboardingUpdateSchema,
} from '@/lib/api/middleware/validation';

export async function GET() {
  try {
    const { error, userId } = await requireAuth();
    if (error) return error;

    const state = await onboardingService.getOnboardingState(userId!);
    return createSuccessResponse(state);
  } catch (error) {
    console.error('Error fetching onboarding state:', error);
    return createErrorResponse('Failed to fetch onboarding state', 500, 'FETCH_FAILED');
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId, 10, 60000)) {
      return createErrorResponse('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const { error, userId } = await requireAuth();
    if (error) return error;

    const validation = await validateRequestBody(request, OnboardingUpdateSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const state = await onboardingService.updateOnboardingState(userId!, validation.data!);
    return createSuccessResponse(state);
  } catch (error) {
    console.error('Error updating onboarding state:', error);
    return createErrorResponse('Failed to update onboarding state', 500, 'UPDATE_FAILED');
  }
} 