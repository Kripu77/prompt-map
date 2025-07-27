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
} from '@/lib/api/middleware/validation';
import { z } from 'zod';

const TopicShiftRequestSchema = z.object({
  prompt: PromptPayloadSchema.shape.prompt,
  context: z.object({
    originalPrompt: z.string().min(1, 'Original prompt is required'),
    existingMindmap: z.string().min(1, 'Existing mindmap is required'),
    previousPrompts: z.array(z.string()).optional(),
    isFollowUp: z.literal(true),
    checkTopicShift: z.literal(true),
  }),
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

    const validation = await validateRequestBody(request, TopicShiftRequestSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { prompt, context } = validation.data!;
    const payload = { prompt, context };
    const result = await mindmapService.analyzeTopicShift(payload);

    return createSuccessResponse({
      isTopicShift: result.isTopicShift,
      confidence: result.confidence,
      reason: result.reason,
      recommendation: result.isTopicShift 
        ? 'Create a new mindmap for this topic'
        : 'Continue with the current mindmap',
    });

  } catch (error) {
    console.error('Topic shift analysis error:', error);
    
    return createSuccessResponse({
      isTopicShift: false,
      confidence: 0,
      reason: 'Analysis failed - defaulting to no topic shift',
      recommendation: 'Continue with the current mindmap',
    });
  }
}