import { streamingLLMClient } from '../llm/streaming-client';
import {
  createInitialMindmapPrompt,
  createFollowUpMindmapPrompt,
  enhancePromptWithContext,
  addChainOfThoughtPrompting
} from '../llm/prompts/mindmap-prompts';
import { webSearchTool } from '@/lib/tools/web-search-tool';
import type { PromptPayload } from '@/types/api';
import type { MindmapGenerationOptions } from './mindmap-service';

export class StreamingMindmapService {
  async streamMindmapGeneration(
    payload: PromptPayload,
    options: MindmapGenerationOptions & { enableWebSearch?: boolean; customDate?: Date } = {}
  ) {
    try {
      // Auto-detect if web search should be enabled based on prompt content
      const promptText = payload.prompt.toLowerCase();
      const hasCurrentKeywords = [
        'latest', 'recent', 'current', 'today', 'now', 'breaking', 'update', 
        'trending', '2025',  'news', 'weather', 'stock', 'market'
      ].some(keyword => promptText.includes(keyword));
      
      // Enable web search by default, or if current keywords detected, or if explicitly requested
      const enableWebSearch = options.enableWebSearch ?? hasCurrentKeywords ?? true;
      const hasExaKey = !!process.env.EXA_API_KEY;
      
      console.log(`Web search enabled: ${enableWebSearch}, EXA_API_KEY present: ${hasExaKey}`);
      
      let messages;
      
      if (payload.context?.isFollowUp && payload.context.existingMindmap) {
        messages = createFollowUpMindmapPrompt(
          payload.context.originalPrompt || payload.prompt,
          payload.context.existingMindmap as string,
          payload.prompt,
          payload.context.previousPrompts || [],
          undefined,
          options.customDate
        );
      } else {
        let enhancedPrompt = payload.prompt;
        
        if (Object.keys(options).length > 0) {
          enhancedPrompt = enhancePromptWithContext(enhancedPrompt, options);
        }
        
        if (options.useChainOfThought) {
          enhancedPrompt = addChainOfThoughtPrompting(enhancedPrompt);
        }
        
        messages = createInitialMindmapPrompt(enhancedPrompt, undefined, options.customDate);
      }
      
      if (enableWebSearch && !hasExaKey) {
        console.warn('Web search requested but EXA_API_KEY not configured. Add EXA_API_KEY to environment variables.');
      }
      
      const result = await streamingLLMClient.streamText({
        messages,
        config: {
          temperature: 0.1,
          maxOutputTokens: 1200,
          includeReasoning: true,
          tools: enableWebSearch && hasExaKey ? {
            'search.web': webSearchTool
          } : undefined,
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