import { NextRequest } from 'next/server';
import { threadsService } from '@/lib/api/services/threads-service';
import {
  validateRequestBody,
  createValidationErrorResponse,
  createErrorResponse,
  createSuccessResponse,
  checkRateLimit,
  getClientIdentifier,
  requireAuth,
  ThreadCreateSchema,
} from '@/lib/api/middleware/validation';

export async function GET() {
  try {
    const { error, userId } = await requireAuth();
    if (error) return error;

    const threads = await threadsService.getThreads(userId!);
    return createSuccessResponse({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return createErrorResponse('Failed to fetch threads', 500, 'FETCH_FAILED');
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId, 20, 60000)) {
      return createErrorResponse('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const { error, userId } = await requireAuth();
    if (error) return error;

    const validation = await validateRequestBody(request, ThreadCreateSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const thread = await threadsService.createThread(validation.data!, userId!);
    return createSuccessResponse({ thread }, 'Thread created successfully', 201);
  } catch (error) {
    console.error('Error creating thread:', error);
    return createErrorResponse('Failed to create thread', 500, 'CREATE_FAILED');
  }
} 