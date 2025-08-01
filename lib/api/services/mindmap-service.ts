
import { llmClient } from '../llm/client';
import {
  createInitialMindmapPrompt,
  createFollowUpMindmapPrompt,
  createTopicShiftPrompt,
  enhancePromptWithContext,
  addChainOfThoughtPrompting
} from '../llm/prompts/mindmap-prompts';
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
}

export interface TopicShiftAnalysis {
  isTopicShift: boolean;
  confidence: number;
  reasoning: string;
  recommendation: string;
}


export class MindmapService {
  /**
   * Generate a new mindmap from a prompt
   */
  async generateMindmap(
    payload: PromptPayload,
    options: MindmapGenerationOptions = {}
  ): Promise<MindmapResponse> {
    try {
      let messages;
      
      if (payload.context?.isFollowUp && payload.context.existingMindmap) {
        // Generate follow-up mindmap
        messages = createFollowUpMindmapPrompt(
          payload.context.originalPrompt || payload.prompt,
          payload.context.existingMindmap as string,
          payload.prompt,
          payload.context.previousPrompts || []
        );
      } else {
        // Generate initial mindmap
        let enhancedPrompt = payload.prompt;
        
        // Apply context enhancements
        if (Object.keys(options).length > 0) {
          enhancedPrompt = enhancePromptWithContext(enhancedPrompt, options);
        }
        
        // Add chain of thought if requested
        if (options.useChainOfThought) {
          enhancedPrompt = addChainOfThoughtPrompting(enhancedPrompt);
        }
        
        messages = createInitialMindmapPrompt(enhancedPrompt);
      }
      
      const response = await llmClient.generateText({
        messages,
        config: {
          temperature: 0.7,
          maxTokens: 3000,
        }
      });
      
      // Validate and clean the response
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
      throw this.handleServiceError(error, 'mindmap_generation_failed');
    }
  }
  
  /**
   * Analyze if a follow-up question represents a topic shift
   */
  async analyzeTopicShift(payload: PromptPayload): Promise<TopicShiftResponse> {
    try {
      // Extract current topic from existing mindmap
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
      
      const messages = createTopicShiftPrompt(
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
  
  private handleServiceError(error: unknown, code: string): Error {
    if (error instanceof Error) {
      return new Error(`${code}: ${error.message}`);
    }
    return new Error(`${code}: Unknown error occurred`);
  }
}

export const mindmapService = new MindmapService();