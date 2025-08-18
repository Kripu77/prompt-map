import { streamingLLMClient } from '../../llm/streaming-client';
import { MindmapPromptOrchestrator } from '../../llm/prompts';
import { webSearchTool } from '@/lib/tools/web-search-tool';
import { WebSearchDetector, type WebSearchConfig } from '../infrastructure/web-search-detector';
import { PromptEnhancementService, type PromptEnhancementOptions } from '../infrastructure/prompt-enhancement-service';
import { MindmapValidator } from '../infrastructure/mindmap-validator';
import { ErrorHandler } from '../infrastructure/error-handler';
import type { PromptPayload } from '@/types/api';
import type { MindmapGenerationOptions, ServiceDependencies } from './mindmap-service';

export class StreamingMindmapService {
  private orchestrator: MindmapPromptOrchestrator;
  private webSearchDetector: typeof WebSearchDetector;
  private promptEnhancer: typeof PromptEnhancementService;
  private validator: typeof MindmapValidator;
  private errorHandler: typeof ErrorHandler;

  constructor(dependencies: ServiceDependencies = {}) {
    this.orchestrator = dependencies.orchestrator || new MindmapPromptOrchestrator();
    this.webSearchDetector = dependencies.webSearchDetector || WebSearchDetector;
    this.promptEnhancer = dependencies.promptEnhancer || PromptEnhancementService;
    this.validator = dependencies.validator || MindmapValidator;
    this.errorHandler = dependencies.errorHandler || ErrorHandler;
  }

  async streamMindmapGeneration(
    payload: PromptPayload,
    options: MindmapGenerationOptions = {}
  ) {
    try {
      const promptValidation = this.validator.validatePrompt(payload.prompt);
      if (!promptValidation.isValid) {
        throw this.errorHandler.createValidationError(
          `Invalid prompt: ${promptValidation.errors.join(', ')}`,
          { operation: 'streamMindmapGeneration', prompt: payload.prompt }
        );
      }

      const webSearchConfig: WebSearchConfig = {
        enableWebSearch: options.enableWebSearch,
        hasExaKey: !!process.env.EXA_API_KEY
      };
      
      const webSearchResult = this.webSearchDetector.detect(payload.prompt, webSearchConfig);
      this.webSearchDetector.validateConfiguration(webSearchResult);
      
      console.log(`Web search enabled: ${webSearchResult.shouldEnableWebSearch}, EXA_API_KEY present: ${webSearchResult.hasExaKey}`);
      
      let messages;
      
      if (payload.context?.isFollowUp && payload.context.existingMindmap) {
        messages = this.orchestrator.createFollowUpPrompt(
          payload.context.originalPrompt || payload.prompt,
          payload.context.existingMindmap as string,
          payload.prompt,
          payload.context.previousPrompts || [],
          'comprehensive',
          options.customDate ? { customDate: options.customDate } : undefined
        );
      } else {
        let enhancedPrompt = payload.prompt;
        
        if (Object.keys(options).length > 0) {
          const contextStr = Object.entries(options)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          enhancedPrompt = `${contextStr}\n\n${enhancedPrompt}`;
        }
        
        const enhancementOptions: PromptEnhancementOptions = {
          enableChainOfThought: options.useChainOfThought,
          mode: 'comprehensive'
        };
        const enhanced = this.promptEnhancer.enhance(enhancedPrompt, enhancementOptions);
        enhancedPrompt = enhanced.content;
        
        messages = this.orchestrator.createInitialPrompt(
          enhancedPrompt, 
          'comprehensive', 
          options.customDate ? { customDate: options.customDate } : undefined
        );
      }
      
      const result = await streamingLLMClient.streamText({
        messages,
        config: {
          temperature: 0.1,
          maxOutputTokens: 1200,
          includeReasoning: true,
          tools: webSearchResult.shouldEnableWebSearch && webSearchResult.hasExaKey ? {
            'search.web': webSearchTool
          } : undefined,
        }
      });
      return result;
    } catch (error) {
      const handledError = this.errorHandler.handleError(error, {
        operation: 'streamMindmapGeneration',
        prompt: payload.prompt
      });
      this.errorHandler.logError(handledError);
      throw handledError;
    }
  }
}

export const streamingMindmapService = new StreamingMindmapService();