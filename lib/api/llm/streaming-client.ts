import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import type { CoreMessage } from "ai";

export interface StreamingConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  includeReasoning?: boolean;
  tools?: unknown;
}

export interface StreamingRequest {
  messages: CoreMessage[];
  config?: StreamingConfig;
}

const DEFAULT_STREAMING_CONFIG: Required<Omit<StreamingConfig, 'tools'>> & Pick<StreamingConfig, 'tools'> = {
  model: "deepseek/deepseek-r1",
  temperature: 0.1,
  maxOutputTokens: 1200,
  topP: 0.9,
  includeReasoning: true,
  tools: undefined,
};

class StreamingLLMClient {
  private openrouter: ReturnType<typeof createOpenRouter>;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }
    
    this.openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async streamText(request: StreamingRequest) {
    const config = { ...DEFAULT_STREAMING_CONFIG, ...request.config };

    try {
      const result = await streamText({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model: this.openrouter.chat(config.model) as any,
        messages: request.messages,
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
        topP: config.topP,
        tools: config.tools,
        maxSteps: 2,
        reasoning: config.includeReasoning ? {
          enabled: true,
          effort: "medium"
        } : undefined,
        sendReasoning: config.includeReasoning,
        onError: ({ error }: { error: unknown }) => {
          console.error('StreamText error:', error instanceof Error ? error.message : 'Unknown error');
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    
      return result;
    } catch (error) {
      throw new Error(`Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const streamingLLMClient = new StreamingLLMClient();