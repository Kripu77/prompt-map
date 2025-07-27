import { NextRequest } from 'next/server';
import { mindmapService } from '@/lib/api/services/mindmap-service';
import {
  validateRequestBody,
  createValidationErrorResponse,
  createErrorResponse,
  createSuccessResponse,
  checkRateLimit,
  getClientIdentifier,
  PromptPayloadSchema,
  MindmapOptionsSchema,
} from '@/lib/api/middleware/validation';
import { z } from 'zod';

const MindmapGenerateRequestSchema = z.object({
  prompt: PromptPayloadSchema.shape.prompt,
  context: PromptPayloadSchema.shape.context,
  options: MindmapOptionsSchema.optional(),
});

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    if (!checkRateLimit(clientId, 50, 60000)) {
      return createErrorResponse(
        'Rate limit exceeded. Please try again later.',
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }

    const validation = await validateRequestBody(request, MindmapGenerateRequestSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { prompt, context, options } = validation.data!;
    const payload = { prompt, context };
    const result = await mindmapService.generateMindmap(payload, options);

    return createSuccessResponse({
      content: result.content,
      metadata: result.metadata,
    });

  } catch (error) {
    console.error('Mindmap generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return createErrorResponse(
          'AI service rate limit exceeded. Please try again later.',
          429,
          'AI_RATE_LIMIT'
        );
      }
      
      if (error.message.includes('Invalid mindmap format')) {
        return createErrorResponse(
          'Failed to generate valid mindmap. Please try rephrasing your prompt.',
          422,
          'INVALID_MINDMAP_FORMAT'
        );
      }
      
      return createErrorResponse(
        'Failed to generate mindmap. Please try again.',
        500,
        'GENERATION_FAILED'
      );
    }

    return createErrorResponse('An unexpected error occurred.', 500, 'UNKNOWN_ERROR');
  }
}