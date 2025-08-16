import { NextRequest } from 'next/server';
import { threadsService } from '@/lib/api/services/threads-service';
import { z } from 'zod';
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

const PaginationQuerySchema = z.object({
  limit: z.string().optional().transform((val) => {
    if (!val) return 20;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) return 20;
    return Math.min(parsed, 100); // Cap at 100
  }),
  offset: z.string().optional().transform((val) => {
    if (!val) return 0;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  }),
  search: z.string().nullable().optional().transform(val => val || undefined),
});

export async function GET(request: NextRequest) {
  try {
    const { error, userId } = await requireAuth();
    if (error) return error;

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      search: searchParams.get('search'),
    };

    const validation = PaginationQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return createValidationErrorResponse(errorMessages);
    }

    const { limit, offset, search } = validation.data;
    const result = await threadsService.getThreads(userId!, { limit, offset, search });
    
    return createSuccessResponse(result);
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