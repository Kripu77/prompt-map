
import { llmClient } from '../../llm/client';
import { MindmapPromptOrchestrator } from '../../llm/prompts';
import { webSearchTool } from '@/lib/tools/web-search-tool';
import { WebSearchDetector, type WebSearchConfig } from '../infrastructure/web-search-detector';
import { PromptEnhancementService, type PromptEnhancementOptions } from '../infrastructure/prompt-enhancement-service';
import { MindmapValidator } from '../infrastructure/mindmap-validator';
import { ErrorHandler } from '../infrastructure/error-handler';
import type { 
  PromptPayload, 
  MindmapResponse, 
  TopicShiftResponse 
} from '@/types/api';

export interface MindmapGenerationOptions {
  userExpertise?: 'beginner' | 'intermediate' | 'advanced';
  purpose?: 'learning' | 'reference' | 'teaching' | 'planning';
  timeConstraint?: 'quick' | 'detailed' | 'comprehensive';
  format?: 'academic' | 'practical' | 'creative';
  useChainOfThought?: boolean;
  customDate?: Date;
  enableWebSearch?: boolean;
}

export interface ServiceDependencies {
  orchestrator?: MindmapPromptOrchestrator;
  webSearchDetector?: typeof WebSearchDetector;
  promptEnhancer?: typeof PromptEnhancementService;
  validator?: typeof MindmapValidator;
  errorHandler?: typeof ErrorHandler;
}

export interface TopicShiftAnalysis {
  isTopicShift: boolean;
  confidence: number;
  reasoning: string;
  recommendation: string;
}


export class MindmapService {
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
  async generateMindmap(
    payload: PromptPayload,
    options: MindmapGenerationOptions = {}
  ): Promise<MindmapResponse> {
    try {
      const promptValidation = this.validator.validatePrompt(payload.prompt);
      if (!promptValidation.isValid) {
        throw this.errorHandler.createValidationError(
          `Invalid prompt: ${promptValidation.errors.join(', ')}`,
          { operation: 'generateMindmap', prompt: payload.prompt }
        );
      }

      const webSearchConfig: WebSearchConfig = {
        enableWebSearch: options.enableWebSearch,
        hasExaKey: !!process.env.EXA_API_KEY
      };
      
      const webSearchResult = this.webSearchDetector.detect(payload.prompt, webSearchConfig);
      this.webSearchDetector.validateConfiguration(webSearchResult);
      
      console.log(`Non-streaming web search enabled: ${webSearchResult.shouldEnableWebSearch}, EXA_API_KEY present: ${webSearchResult.hasExaKey}`);
      
      let messages;
      
      if (payload.context?.isFollowUp && payload.context.existingMindmap) {
        // Generate follow-up mindmap
        messages = this.orchestrator.createFollowUpPrompt(
          payload.context.originalPrompt || payload.prompt,
          payload.context.existingMindmap as string,
          payload.prompt,
          payload.context.previousPrompts || [],
          'comprehensive',
          options.customDate ? { customDate: options.customDate } : undefined
        );
      } else {
        // Generate initial mindmap
        let enhancedPrompt = payload.prompt;
        
        // Apply context enhancements
        if (Object.keys(options).length > 0) {
          const contextStr = Object.entries(options)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          enhancedPrompt = `${contextStr}\n\n${enhancedPrompt}`;
        }
        
        // Enhance prompt with options
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
      
      // Configure tools - use real web search if available
      const tools = webSearchResult.shouldEnableWebSearch && webSearchResult.hasExaKey ? {
        ['search.web']: webSearchTool
      } : undefined;
      
      const response = await llmClient.generateText({
        messages,
        config: {
          temperature: 0.1,
          maxTokens: 2000,
          tools,
        }
      });
      
      const responseValidation = this.validator.validateResponse(response.content);
      if (!responseValidation.isValid) {
        throw this.errorHandler.createProcessingError(
          `Invalid response: ${responseValidation.errors.join(', ')}`,
          { operation: 'generateMindmap', prompt: payload.prompt }
        );
      }

      const cleanedContent = this.validateAndCleanMindmap(response.content);
      
      return {
        content: cleanedContent,
        metadata: {
          nodeCount: this.countNodes(cleanedContent),
          depth: this.calculateDepth(cleanedContent),
          generatedAt: new Date().toISOString(),
        }
      };
    } catch (error) {
      const handledError = this.errorHandler.handleError(error, {
        operation: 'generateMindmap',
        prompt: payload.prompt
      });
      this.errorHandler.logError(handledError);
      throw handledError;
    }
  }
  
  async analyzeTopicShift(payload: PromptPayload): Promise<TopicShiftResponse> {
    try {
      const promptValidation = this.validator.validatePrompt(payload.prompt);
      if (!promptValidation.isValid) {
        throw this.errorHandler.createValidationError(
          `Invalid prompt: ${promptValidation.errors.join(', ')}`,
          { operation: 'analyzeTopicShift', prompt: payload.prompt }
        );
      }

      const currentTopic = this.extractTopicFromMindmap(
        payload.context?.existingMindmap as string
      );
      
      if (!currentTopic) {
        return {
          isTopicShift: false,
          confidence: 0,
          reason: 'Unable to determine current topic'
        };
      }
      
      const messages = this.orchestrator.createTopicShiftPrompt(
        currentTopic,
        payload.context?.originalPrompt || '',
        payload.prompt
      );
      
      const analysis = await llmClient.generateStructuredResponse<TopicShiftAnalysis>(
        {
          messages,
          config: {
            temperature: 0.1, // Low temperature for consistent analysis
            maxTokens: 500,
          }
        },
        {
          isTopicShift: 'boolean',
          confidence: 'number',
          reasoning: 'string',
          recommendation: 'string'
        }
      );
      
      return {
        isTopicShift: analysis.isTopicShift,
        confidence: analysis.confidence,
        reason: analysis.reasoning
      };
    } catch (error) {
      // Default to no topic shift on error to allow request to proceed
      console.error('Topic shift analysis failed:', error);
      return {
        isTopicShift: false,
        confidence: 0,
        reason: 'Analysis failed - defaulting to no topic shift'
      };
    }
  }
  
  /**
   * Get service health and statistics
   */
  getServiceHealth() {
    const llmStats = llmClient.getStats();
    
    return {
      status: 'healthy',
      llm: {
        requestCount: llmStats.requestCount,
        errorCount: llmStats.errorCount,
        successRate: llmStats.successRate,
      },
      timestamp: new Date().toISOString(),
    };
  }
  

  private validateAndCleanMindmap(content: string): string {
    // Remove any non-markdown content
    const lines = content.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed === '' || trimmed.match(/^#{1,3}\s+.+/);
    });
    
    // Ensure we have a title (first line with single #)
    if (cleanedLines.length === 0 || !cleanedLines[0].startsWith('# ')) {
      throw new Error('Invalid mindmap format: missing title');
    }
    
    // Ensure we have at least some content
    const contentLines = cleanedLines.filter(line => line.trim() !== '');
    if (contentLines.length < 3) {
      throw new Error('Invalid mindmap format: insufficient content');
    }
    
    return cleanedLines.join('\n').trim();
  }
  
  private countNodes(content: string): number {
    const lines = content.split('\n');
    return lines.filter(line => line.trim().match(/^#{1,3}\s+.+/)).length;
  }
  
  private calculateDepth(content: string): number {
    const lines = content.split('\n');
    let maxDepth = 0;
    
    for (const line of lines) {
      const match = line.match(/^(#{1,3})\s+/);
      if (match) {
        maxDepth = Math.max(maxDepth, match[1].length);
      }
    }
    
    return maxDepth;
  }
  
  private extractTopicFromMindmap(mindmap: string): string | null {
    if (!mindmap) return null;
    
    const match = mindmap.match(/^# (.+)$/m);
    return match ? match[1].trim() : null;
  }
  

}

export const mindmapService = new MindmapService();