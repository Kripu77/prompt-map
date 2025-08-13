import { NextRequest } from 'next/server';
import { streamingMindmapService } from '@/lib/api/services/streaming-mindmap-service';
import {
  validateRequestBody,
  createValidationErrorResponse,
  createErrorResponse,
  checkRateLimit,
  getClientIdentifier,
  PromptPayloadSchema,
  MindmapOptionsSchema,
} from '@/lib/api/middleware/validation';
import { z } from 'zod';

// Schema for useCompletion hook requests
const CompletionRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  // Additional data from useCompletion hook
  options: MindmapOptionsSchema.optional(),
  context: PromptPayloadSchema.shape.context.optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId, 30, 60000)) {
      return createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const validation = await validateRequestBody(request, CompletionRequestSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { prompt, context, options } = validation.data!;
    const payload = { prompt, context };

    const result = await streamingMindmapService.streamMindmapGeneration(payload, options);
    
    return result.toDataStreamResponse({
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      sendReasoning: true,
    });

  } catch (error) {
    console.error('Streaming mindmap generation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      error
    });
    
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return createErrorResponse(
          'AI service rate limit exceeded. Please try again later.',
          429,
          'AI_RATE_LIMIT'
        );
      }
      
      return createErrorResponse(
        'Failed to start mindmap generation stream.',
        500,
        'STREAMING_FAILED'
      );
    }

    return createErrorResponse('An unexpected error occurred.', 500, 'UNKNOWN_ERROR');
  }
}