import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import type { CoreMessage, CoreTool } from "ai";

export interface StreamingConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  includeReasoning?: boolean;
  tools?: Record<string, CoreTool>;
}

export interface StreamingRequest {
  messages: CoreMessage[];
  config?: StreamingConfig;
}

const DEFAULT_STREAMING_CONFIG: Required<Omit<StreamingConfig, 'tools'>> & Pick<StreamingConfig, 'tools'> = {
  model: "deepseek/deepseek-r1",
  temperature: 0.7,
  maxTokens: 1200,
  topP: 0.9,
  includeReasoning: true,
  tools: undefined,
};

class StreamingLLMClient {
  private client: ReturnType<typeof createOpenRouter>;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }

    this.client = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL,
    });
  }

  async streamText(request: StreamingRequest) {
    const config = { ...DEFAULT_STREAMING_CONFIG, ...request.config };

    try {
      console.log('StreamingLLMClient: Starting stream with config:', {
        model: config.model,
        includeReasoning: config.includeReasoning,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      });

      const result = await streamText({
        model: this.client(config.model),
        messages: request.messages,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        topP: config.topP,
        tools: config.tools,
        experimental_providerMetadata: config.includeReasoning ? {
          openrouter: {
            include_reasoning: true,
          },
        } : undefined,
        onError: ({ error }) => {
          console.error('StreamText error occurred:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            type: typeof error,
            error
          });
        },
      });

      console.log('StreamingLLMClient: Stream created successfully');
      return result;
    } catch (error) {
      console.error('StreamingLLMClient error:', error);
      throw new Error(`Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const streamingLLMClient = new StreamingLLMClient();