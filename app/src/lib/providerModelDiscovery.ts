import type { Model as OpenAIModel } from "openai/resources/models";
import {
  aiProviders,
  type ModelOption,
  type Provider,
  type ProviderConfig,
} from "@/lib/aiProviders.ts";

type JsonRecord = Record<string, unknown>;

type AnthropicModelInfo = {
  id: string;
  display_name?: string;
  max_input_tokens?: number | null;
  capabilities?: {
    image_input?: { supported?: boolean } | null;
    thinking?: { supported?: boolean } | null;
  } | null;
};

type GeminiModelInfo = {
  name?: string;
  displayName?: string;
  description?: string;
  supportedActions?: string[];
};

const OPENAI_EXCLUDED_MODEL_PARTS = [
  "audio",
  "dall-e",
  "embedding",
  "image",
  "moderation",
  "realtime",
  "search",
  "speech",
  "transcribe",
  "tts",
  "whisper",
];

export async function discoverProviderModels(
  provider: Provider,
  config: ProviderConfig,
): Promise<ModelOption[]> {
  if (!config.apiKey) {
    throw new Error("Add an API key before refreshing models.");
  }

  if (provider === "openai") return discoverOpenAIModels(config);
  if (provider === "anthropic") return discoverAnthropicModels(config);
  if (provider === "gemini") return discoverGeminiModels(config);
  if (provider === "deepseek") return discoverDeepSeekModels(config);
  throw new Error("Model discovery is not available for custom endpoints yet.");
}

async function discoverOpenAIModels(
  config: ProviderConfig,
): Promise<ModelOption[]> {
  const { OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: aiProviders.openai.apiBaseUrl,
    dangerouslyAllowBrowser: true,
  });
  const page = await client.models.list();
  const models: OpenAIModel[] = [];
  for await (const model of page as AsyncIterable<OpenAIModel>) {
    models.push(model);
  }

  return uniqueModels(
    models
      .filter((model) => isLikelyOpenAIChatModel(model.id))
      .map((model) => ({
        label: labelFromModelId(model.id),
        value: model.id,
      })),
  );
}

async function discoverAnthropicModels(
  config: ProviderConfig,
): Promise<ModelOption[]> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({
    apiKey: config.apiKey,
    baseURL: aiProviders.anthropic.apiBaseUrl,
    dangerouslyAllowBrowser: true,
  });
  const page = await client.models.list();
  const models: AnthropicModelInfo[] = [];
  for await (const model of page as AsyncIterable<AnthropicModelInfo>) {
    models.push(model);
  }

  return uniqueModels(
    models.map((model) => ({
      label: model.display_name || labelFromModelId(model.id),
      value: model.id,
      note: anthropicModelNote(model),
    })),
  );
}

async function discoverGeminiModels(
  config: ProviderConfig,
): Promise<ModelOption[]> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({
    apiKey: config.apiKey,
  });
  const pager = await ai.models.list({ config: { pageSize: 1000 } });
  const models: GeminiModelInfo[] = [];
  for await (const model of pager as AsyncIterable<GeminiModelInfo>) {
    models.push(model);
  }

  return uniqueModels(
    models
      .filter((model) => model.supportedActions?.includes("generateContent"))
      .map((model) => {
        const value = normalizeGeminiModelId(model.name);
        return {
          label: model.displayName || labelFromModelId(value),
          value,
          note: model.description,
        };
      })
      .filter((model) => model.value),
  );
}

async function discoverDeepSeekModels(
  config: ProviderConfig,
): Promise<ModelOption[]> {
  const response = await fetch("https://api.deepseek.com/models", {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });
  if (!response.ok) {
    throw new Error(await responseErrorMessage(response));
  }

  const body = (await response.json()) as JsonRecord;
  const data = Array.isArray(body.data) ? body.data : [];
  return uniqueModels(
    data
      .map((item) => {
        if (!isJsonRecord(item) || typeof item.id !== "string") return null;
        return {
          label: labelFromModelId(item.id),
          value: item.id,
        };
      })
      .filter((model): model is ModelOption => model !== null),
  );
}

function isLikelyOpenAIChatModel(id: string): boolean {
  const normalized = id.toLowerCase();
  if (OPENAI_EXCLUDED_MODEL_PARTS.some((part) => normalized.includes(part))) {
    return false;
  }
  return (
    normalized.startsWith("gpt-") ||
    normalized.startsWith("chatgpt-") ||
    /^o\d/.test(normalized)
  );
}

function normalizeGeminiModelId(value?: string): string {
  if (!value) return "";
  return value.startsWith("models/") ? value.slice("models/".length) : value;
}

function anthropicModelNote(model: AnthropicModelInfo): string | undefined {
  const parts: string[] = [];
  if (model.capabilities?.thinking?.supported) parts.push("Thinking");
  if (model.capabilities?.image_input?.supported) parts.push("Vision");
  if (model.max_input_tokens) {
    parts.push(`${Intl.NumberFormat().format(model.max_input_tokens)} context`);
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function labelFromModelId(value: string): string {
  return value
    .replace(/^models\//, "")
    .split("-")
    .filter(Boolean)
    .map((part) =>
      /^[a-z]/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part,
    )
    .join(" ");
}

function uniqueModels(models: ModelOption[]): ModelOption[] {
  const seen = new Set<string>();
  const out: ModelOption[] = [];
  for (const model of models) {
    if (!model.value || seen.has(model.value)) continue;
    seen.add(model.value);
    out.push(model);
  }
  return out;
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function responseErrorMessage(response: Response): Promise<string> {
  const fallback = `Refresh failed with HTTP ${response.status}`;
  try {
    const body = (await response.json()) as JsonRecord;
    const error = body.error;
    if (typeof error === "string") return error;
    if (isJsonRecord(error) && typeof error.message === "string") {
      return error.message;
    }
    if (typeof body.message === "string") return body.message;
  } catch {
    return fallback;
  }
  return fallback;
}
