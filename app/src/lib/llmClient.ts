import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/chat/completions";
import type { Provider, ProviderSdk } from "@/lib/aiProviders.ts";

export type RealtimeWebSearchRequest = {
  model: string;
  query: string;
  topic?: "general" | "currency" | "stock" | "weather" | "crypto" | "news";
  location?: string;
};

export type RealtimeWebSearchResult = {
  answer: string;
  sources: Array<{ title?: string; url: string }>;
};

/**
 * Minimal structural type satisfied by an OpenAI SDK client. Lets the agentic
 * harness depend only on the chat-completions surface it actually uses.
 */
export interface LLMClient {
  provider?: Provider;
  providerSdk?: ProviderSdk;
  realtimeWebSearch?: (
    request: RealtimeWebSearchRequest,
  ) => Promise<RealtimeWebSearchResult>;
  chat: {
    completions: {
      create: (
        req: ChatCompletionCreateParamsNonStreaming,
      ) => Promise<ChatCompletion>;
    };
  };
}
