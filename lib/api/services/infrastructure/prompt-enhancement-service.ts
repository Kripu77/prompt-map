import { addChainOfThoughtPrompting } from '../../llm/prompts';
import type { MindmapMode } from '../../llm/prompts/types';

export interface PromptEnhancementOptions {
  enableChainOfThought?: boolean;
  context?: string;
  previousMindmap?: string;
  mode?: MindmapMode;
}

export interface EnhancedPrompt {
  content: string;
  hasChainOfThought: boolean;
  hasContext: boolean;
}

export class PromptEnhancementService {
  static enhance(basePrompt: string, options: PromptEnhancementOptions = {}): EnhancedPrompt {
    let enhancedContent = basePrompt;
    let hasChainOfThought = false;
    let hasContext = false;

    // Add context if provided
    if (options.context?.trim()) {
      enhancedContent = this.addContext(enhancedContent, options.context);
      hasContext = true;
    }

    // Add previous mindmap context if provided
    if (options.previousMindmap?.trim()) {
      enhancedContent = this.addPreviousMindmapContext(enhancedContent, options.previousMindmap);
      hasContext = true;
    }

    // Add chain of thought prompting if enabled
    if (options.enableChainOfThought !== false) {
      const mode = options.mode || 'comprehensive';
      enhancedContent = addChainOfThoughtPrompting(enhancedContent, mode);
      hasChainOfThought = true;
    }

    return {
      content: enhancedContent,
      hasChainOfThought,
      hasContext
    };
  }

  private static addContext(prompt: string, context: string): string {
    return `${prompt}\n\nAdditional context: ${context}`;
  }

  private static addPreviousMindmapContext(prompt: string, previousMindmap: string): string {
    return `${prompt}\n\nPrevious mindmap for reference: ${previousMindmap}`;
  }

  static validatePrompt(prompt: string): void {
    if (!prompt?.trim()) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 10000) {
      throw new Error('Prompt is too long (max 10000 characters)');
    }
  }
}