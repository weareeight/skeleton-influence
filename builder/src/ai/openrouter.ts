import { API_CONFIG, AI_MODELS, AI_TEMPERATURE, AI_MAX_TOKENS } from '../config.js';
import type { Message, TaskType, AIResponse } from '../types.js';

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

/**
 * OpenRouter API client for accessing multiple AI models through a unified API
 */
export class OpenRouterClient {
  private baseUrl: string;
  private apiKey: string;
  private referer: string;
  private title: string;

  constructor() {
    this.baseUrl = API_CONFIG.openRouter.baseUrl;
    this.apiKey = API_CONFIG.openRouter.apiKey;
    this.referer = API_CONFIG.openRouter.referer;
    this.title = API_CONFIG.openRouter.title;

    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }
  }

  /**
   * Send a chat completion request
   */
  async chat(
    messages: Message[],
    taskType: TaskType,
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<AIResponse> {
    const model = this.getModel(taskType);
    const temperature = options?.temperature ?? AI_TEMPERATURE[taskType];
    const maxTokens = options?.maxTokens ?? AI_MAX_TOKENS[taskType];

    const response = await this.request('/chat/completions', {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return {
      content: response.choices[0].message.content,
      model: response.model,
      tokensUsed: response.usage.total_tokens,
    };
  }

  /**
   * Send a request with retry logic
   */
  private async request(
    endpoint: string,
    body: Record<string, unknown>,
    retries = 3
  ): Promise<OpenRouterResponse> {
    const url = `${this.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.referer,
            'X-Title': this.title,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as OpenRouterError;
          throw new Error(
            `OpenRouter API error: ${errorData.error?.message || response.statusText}`
          );
        }

        return (await response.json()) as OpenRouterResponse;
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Request failed after all retries');
  }

  /**
   * Get the appropriate model for the task type
   */
  private getModel(taskType: TaskType): string {
    return AI_MODELS[taskType];
  }

  /**
   * Create a system message
   */
  static systemMessage(content: string): Message {
    return { role: 'system', content };
  }

  /**
   * Create a user message
   */
  static userMessage(content: string): Message {
    return { role: 'user', content };
  }

  /**
   * Create an assistant message
   */
  static assistantMessage(content: string): Message {
    return { role: 'assistant', content };
  }
}

// Singleton instance
let clientInstance: OpenRouterClient | null = null;

/**
 * Get the OpenRouter client instance
 */
export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = new OpenRouterClient();
  }
  return clientInstance;
}

/**
 * Convenience function for chat completion
 */
export async function chat(
  messages: Message[],
  taskType: TaskType
): Promise<string> {
  const client = getOpenRouterClient();
  const response = await client.chat(messages, taskType);
  return response.content;
}

export default OpenRouterClient;
