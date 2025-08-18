import { NextRequest } from 'next/server';
import { streamingMindmapService } from '@/lib/api/services/core/streaming-mindmap-service';
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

// Schema for AI SDK useChat hook requests
const ChatMessage = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  data: z.any().optional(),
  parts: z.array(z.any()).optional(),
});

const ChatRequestSchema = z.object({
  id: z.string().optional(),
  messages: z.array(ChatMessage),
  data: z.object({
    prompt: z.string().min(1, 'Prompt is required').optional(),
    options: MindmapOptionsSchema.optional(),
    context: PromptPayloadSchema.shape.context.optional(),
  }).optional(),
});

// Legacy schema for direct prompt requests
const CompletionRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
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

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('JSON parsing error:', error);
      return createErrorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
    }
    
    // Try to parse as AI SDK chat request first
    const chatValidation = ChatRequestSchema.safeParse(body);
    if (!chatValidation.success) {
      console.log('Chat validation errors:', chatValidation.error.errors);
    }
    if (chatValidation.success) {
      const { messages, data } = chatValidation.data;
      
      // Get the last user message as the prompt
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (!lastUserMessage) {
        return createErrorResponse('No user message found', 400, 'INVALID_REQUEST');
      }
      
      const prompt = lastUserMessage.content;
      let context: any;
      let options: any;
      
      // Extract options from message data or top-level data
      if (lastUserMessage.data) {
        options = lastUserMessage.data;
      } else if (data?.options) {
        options = data.options;
      }
      
      if (data?.context) {
        context = data.context;
      }
      
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
    }
    
    // Fall back to legacy completion request format
    const validation = await validateRequestBody(request, CompletionRequestSchema);
    if (!validation.success) {
      return createValidationErrorResponse(validation.errors!);
    }

    const { prompt, context, options } = validation.data!;
    const payload = { prompt, context };

    const result = await streamingMindmapService.streamMindmapGeneration(payload, options);
    
    console.log('=== DEBUGGING STREAM RESULT ===');
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result));
    console.log('Result experimental_providerMetadata:', result.experimental_providerMetadata);
    console.log('=== END STREAM DEBUG ===');
    
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