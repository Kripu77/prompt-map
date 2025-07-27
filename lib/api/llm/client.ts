import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import type { CoreMessage } from "ai";

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface LLMRequest {
  messages: CoreMessage[];
  config?: LLMConfig;
  retries?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export interface LLMError {
  code: string;
  message: string;
  details?: unknown;
  retryable: boolean;
}


const DEFAULT_CONFIG: Required<LLMConfig> = {
  model: "deepseek/deepseek-r1-0528:free",
  temperature: 0.7,
  maxTokens: 2000,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
};


class LLMClient {
  private client: ReturnType<typeof createOpenRouter>;
  private requestCount = 0;
  private errorCount = 0;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }

    this.client = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL,
    });
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    const config = { ...DEFAULT_CONFIG, ...request.config };
    const maxRetries = request.retries ?? 3;
    
    let lastError: LLMError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        this.requestCount++;
        
        const result = await generateText({
          model: this.client(config.model),
          messages: request.messages,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          topP: config.topP,
          frequencyPenalty: config.frequencyPenalty,
          presencePenalty: config.presencePenalty,
        });

        return this.formatResponse(result, config.model);
      } catch (error) {
        this.errorCount++;
        lastError = this.parseError(error);
        
        // Don't retry if error is not retryable or we've exhausted retries
        if (!lastError.retryable || attempt === maxRetries) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Unknown error occurred');
  }

  /**
   * Generate structured JSON response with validation
   */
  async generateStructuredResponse<T>(
    request: LLMRequest,
    schema: Record<string, unknown>
  ): Promise<T> {
    // Add JSON formatting instruction to the last message
    const enhancedMessages = [...request.messages];
    const lastMessage = enhancedMessages[enhancedMessages.length - 1];
    
    if (lastMessage.role === 'user') {
      lastMessage.content += `\n\nIMPORTANT: Respond with valid JSON only. No additional text. Follow this schema: ${JSON.stringify(schema)}`;
    }

    const response = await this.generateText({
      ...request,
      messages: enhancedMessages,
      config: {
        ...request.config,
        temperature: 0.1, // Lower temperature for structured output
      }
    });

    try {
      return JSON.parse(response.content.trim()) as T;
    } catch (parseError) {
      throw {
        code: 'invalid_json',
        message: 'Failed to parse LLM response as JSON',
        details: { response: response.content, parseError },
        retryable: true
      } as LLMError;
    }
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: this.requestCount > 0 ? 
        ((this.requestCount - this.errorCount) / this.requestCount) * 100 : 0
    };
  }



  private formatResponse(result: { text: string; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; finishReason?: string }, model: string): LLMResponse {
    return {
      content: result.text,
      usage: result.usage ? {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      } : undefined,
      model,
      finishReason: result.finishReason || 'unknown',
    };
  }

  private parseError(error: unknown): LLMError {
    if (error instanceof Error) {
      // Check for specific error types
      const message = error.message.toLowerCase();
      
      if (message.includes('rate limit')) {
        return {
          code: 'rate_limit_exceeded',
          message: 'Rate limit exceeded. Please try again later.',
          details: error,
          retryable: true
        };
      }
      
      if (message.includes('timeout')) {
        return {
          code: 'timeout',
          message: 'Request timed out. Please try again.',
          details: error,
          retryable: true
        };
      }
      
      if (message.includes('network') || message.includes('connection')) {
        return {
          code: 'network_error',
          message: 'Network error. Please check your connection.',
          details: error,
          retryable: true
        };
      }
      
      return {
        code: 'unknown_error',
        message: error.message,
        details: error,
        retryable: false
      };
    }
    
    return {
      code: 'unknown_error',
      message: 'An unknown error occurred',
      details: error,
      retryable: false
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


export const llmClient = new LLMClient();



/**
 * Create a system message with role definition
 */
export function createSystemMessage(content: string): CoreMessage {
  return {
    role: 'system',
    content
  };
}

/**
 * Create a user message
 */
export function createUserMessage(content: string): CoreMessage {
  return {
    role: 'user',
    content
  };
}

/**
 * Create an assistant message
 */
export function createAssistantMessage(content: string): CoreMessage {
  return {
    role: 'assistant',
    content
  };
}