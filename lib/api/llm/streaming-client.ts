import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import type { CoreMessage } from "ai";

export interface StreamingConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface StreamingRequest {
  messages: CoreMessage[];
  config?: StreamingConfig;
}

const DEFAULT_STREAMING_CONFIG: Required<StreamingConfig> = {
  model: "deepseek/deepseek-r1-0528:free",
  temperature: 0.7,
  maxTokens: 3000,
  topP: 0.9,
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


      const result = await streamText({
        model: this.client(config.model),
        messages: request.messages,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        topP: config.topP,
      });

      return result;
    } catch (error) {
      console.error('StreamingLLMClient error:', error);
      throw new Error(`Streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const streamingLLMClient = new StreamingLLMClient();