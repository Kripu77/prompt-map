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
  ThreadUpdateSchema,
} from '@/lib/api/middleware/validation';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { error, userId } = await requireAuth();
    if (error) return error;

    const params = await context.params;
    const thread = await threadsService.getThread(params.id, userId!);
    if (!thread) {
      return createErrorResponse('Thread not found', 404, 'THREAD_NOT_FOUND');
    }

    return createSuccessResponse({ thread });
  } catch (error) {
    console.error('Error fetching thread:', error);
    return createErrorResponse('Failed to fetch thread', 500, 'FETCH_FAILED');
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId, 10, 60000)) {
      return createErrorResponse('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const { error, userId } = await requireAuth();
    if (error) return error;

    const validation = await validateRequestBody(request, ThreadUpdateSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const params = await context.params;
    const thread = await threadsService.updateThread(params.id, validation.data!, userId!);
    if (!thread) {
      return createErrorResponse('Thread not found', 404, 'THREAD_NOT_FOUND');
    }

    return createSuccessResponse({ thread });
  } catch (error) {
    console.error('Error updating thread:', error);
    return createErrorResponse('Failed to update thread', 500, 'UPDATE_FAILED');
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId, 5, 60000)) {
      return createErrorResponse('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }

    const { error, userId } = await requireAuth();
    if (error) return error;

    const params = await context.params;
    const success = await threadsService.deleteThread(params.id, userId!);
    if (!success) {
      return createErrorResponse('Thread not found', 404, 'THREAD_NOT_FOUND');
    }

    return createSuccessResponse({ success: true, deletedId: params.id });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return createErrorResponse('Failed to delete thread', 500, 'DELETE_FAILED');
  }
} 