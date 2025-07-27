import { streamingLLMClient } from '../llm/streaming-client';
import {
  createInitialMindmapPrompt,
  createFollowUpMindmapPrompt,
  enhancePromptWithContext,
  addChainOfThoughtPrompting
} from '../llm/prompts/mindmap-prompts';
import type { PromptPayload } from '@/types/api';
import type { MindmapGenerationOptions } from './mindmap-service';

export class StreamingMindmapService {
  async streamMindmapGeneration(
    payload: PromptPayload,
    options: MindmapGenerationOptions = {}
  ) {
    try {
      let messages;
      
      if (payload.context?.isFollowUp && payload.context.existingMindmap) {
        messages = createFollowUpMindmapPrompt(
          payload.context.originalPrompt || payload.prompt,
          payload.context.existingMindmap as string,
          payload.prompt,
          payload.context.previousPrompts || []
        );
      } else {
        let enhancedPrompt = payload.prompt;
        
        if (Object.keys(options).length > 0) {
          enhancedPrompt = enhancePromptWithContext(enhancedPrompt, options);
        }
        
        if (options.useChainOfThought) {
          enhancedPrompt = addChainOfThoughtPrompting(enhancedPrompt);
        }
        
        messages = createInitialMindmapPrompt(enhancedPrompt);
      }
      
      const result = await streamingLLMClient.streamText({
        messages,
        config: {
          temperature: 0.7,
          maxTokens: 3000,
        }
      });
      
      return result;
    } catch (error) {
      throw this.handleServiceError(error, 'streaming_mindmap_generation_failed');
    }
  }

  private handleServiceError(error: unknown, code: string): Error {
    if (error instanceof Error) {
      return new Error(`${code}: ${error.message}`);
    }
    return new Error(`${code}: Unknown error occurred`);
  }
}

export const streamingMindmapService = new StreamingMindmapService();