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
      console.log('StreamingLLMClient: Starting stream with config:', {
        model: config.model,
        includeReasoning: config.includeReasoning,
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens
      });

      const result = await streamText({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model: this.openrouter.chat(config.model) as any,
        messages: request.messages,
        temperature: config.temperature,
        maxOutputTokens: config.maxOutputTokens,
        topP: config.topP,
        tools: config.tools,
        experimental_providerMetadata: config.includeReasoning ? {
          openrouter: {
            reasoning: true,
          },
        } : undefined,
        onError: ({ error }: { error: unknown }) => {
          console.error('StreamText error occurred:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            type: typeof error,
            error
          });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      console.log('StreamingLLMClient: Stream created successfully');
      return result;
    } catch (error) {
      console.error('StreamingLLMClient error:', error);
      throw new Error(`Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const streamingLLMClient = new StreamingLLMClient();