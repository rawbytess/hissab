import type Anthropic from "@anthropic-ai/sdk";
import type { GoogleGenAI } from "@google/genai";
import type { OpenAI } from "openai";
import type {
  ChatCompletion,
  ChatCompletionAssistantMessageParam,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessage,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import {
  aiProviders,
  type Provider,
  type ProviderConfig,
  type ProviderSdk,
} from "@/lib/aiProviders.ts";
import type {
  LLMClient,
  RealtimeWebSearchRequest,
  RealtimeWebSearchResult,
} from "@/lib/llmClient.ts";

type JsonRecord = Record<string, unknown>;

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { functionCall: { name: string; args: JsonRecord } }
  | { functionResponse: { name: string; response: JsonRecord } };

type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

type AnthropicBlock =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: { type: "base64"; media_type: string; data: string };
    }
  | {
      type: "document";
      source: { type: "base64"; media_type: string; data: string };
      name?: string;
    }
  | { type: "tool_use"; id: string; name: string; input: JsonRecord }
  | { type: "tool_result"; tool_use_id: string; content: string };

export function createProviderClient(
  provider: Provider,
  cfg: ProviderConfig,
): LLMClient {
  const sdk =
    provider === "custom" ? cfg.sdk : providerSdkForProvider(provider);
  if (sdk === "gemini") return createGeminiClient(provider, cfg);
  if (sdk === "anthropic") return createAnthropicClient(provider, cfg);
  return createOpenAICompatibleClient(provider, cfg);
}

function providerSdkForProvider(provider: Provider): ProviderSdk {
  if (provider === "anthropic") return "anthropic";
  if (provider === "gemini") return "gemini";
  return "openai";
}

function createOpenAICompatibleClient(
  provider: Provider,
  cfg: ProviderConfig,
): LLMClient {
  const getClient = lazyOpenAIClient(provider, cfg);
  const client: LLMClient = {
    provider,
    providerSdk: "openai",
    chat: {
      completions: {
        create: async (req) => {
          try {
            const openai = await getClient();
            return await openai.chat.completions.create(req);
          } catch (error) {
            throw normalizeProviderError(provider, error);
          }
        },
      },
    },
  };
  if (provider === "openai" || provider === "custom") {
    client.realtimeWebSearch = (request) =>
      openAIRealtimeWebSearch(getClient, provider, request);
  }
  return client;
}

function lazyOpenAIClient(provider: Provider, cfg: ProviderConfig) {
  let promise: Promise<OpenAI> | null = null;
  return () => {
    promise ??= import("openai").then(({ OpenAI }) => {
      return new OpenAI({
        apiKey: cfg.apiKey || "placeholder",
        baseURL: resolveBaseUrl(provider, cfg) || undefined,
        dangerouslyAllowBrowser: true,
      });
    });
    return promise;
  };
}

function createGeminiClient(
  provider: Provider,
  cfg: ProviderConfig,
): LLMClient {
  const ai = lazyGeminiClient(provider, cfg);
  return {
    provider,
    providerSdk: "gemini",
    realtimeWebSearch: (request) =>
      geminiRealtimeWebSearch(ai, provider, request),
    chat: {
      completions: {
        create: async (req) => {
          try {
            const body = toGeminiRequest(req);
            const client = await ai();
            const response = await client.models.generateContent({
              model: req.model,
              ...body,
            } as never);
            return fromGeminiResponse(
              req.model,
              response as unknown as JsonRecord,
            );
          } catch (error) {
            throw normalizeProviderError(provider, error);
          }
        },
      },
    },
  };
}

function createAnthropicClient(
  provider: Provider,
  cfg: ProviderConfig,
): LLMClient {
  const client = lazyAnthropicClient(provider, cfg);
  return {
    provider,
    providerSdk: "anthropic",
    realtimeWebSearch: (request) =>
      anthropicRealtimeWebSearch(client, provider, request),
    chat: {
      completions: {
        create: async (req) => {
          try {
            const body = toAnthropicRequest(req);
            const anthropic = await client();
            const response = await anthropic.messages.create(body as never);
            return fromAnthropicResponse(
              req.model,
              response as unknown as JsonRecord,
            );
          } catch (error) {
            throw normalizeProviderError(provider, error);
          }
        },
      },
    },
  };
}

function lazyGeminiClient(provider: Provider, cfg: ProviderConfig) {
  let promise: Promise<GoogleGenAI> | null = null;
  return () => {
    promise ??= import("@google/genai").then(({ GoogleGenAI }) => {
      return new GoogleGenAI({
        apiKey: cfg.apiKey || "placeholder",
        ...(provider === "custom" && cfg.apiBaseUrl
          ? { httpOptions: { baseUrl: cfg.apiBaseUrl } }
          : {}),
      } as never);
    });
    return promise;
  };
}

function lazyAnthropicClient(provider: Provider, cfg: ProviderConfig) {
  let promise: Promise<Anthropic> | null = null;
  return () => {
    promise ??= import("@anthropic-ai/sdk").then(({ default: Anthropic }) => {
      return new Anthropic({
        apiKey: cfg.apiKey || "placeholder",
        ...(provider === "custom" && cfg.apiBaseUrl
          ? { baseURL: cfg.apiBaseUrl }
          : {}),
        dangerouslyAllowBrowser: true,
      });
    });
    return promise;
  };
}

function resolveBaseUrl(
  provider: Provider,
  cfg: ProviderConfig,
): string | undefined {
  const registry = aiProviders[provider]?.apiBaseUrl;
  return registry ?? cfg.apiBaseUrl ?? undefined;
}

function toGeminiRequest(req: ChatCompletionCreateParamsNonStreaming) {
  const contents: GeminiContent[] = [];
  const systemParts: { text: string }[] = [];
  const toolCallNames = new Map<string, string>();

  for (const message of req.messages) {
    if (message.role === "system") {
      const text = contentToText(message.content);
      if (text) systemParts.push({ text });
      continue;
    }
    const content = toGeminiContent(message, toolCallNames);
    if (content.parts.length > 0) contents.push(content);
  }

  const tools = req.tools?.length
    ? [
        {
          functionDeclarations: req.tools
            .filter((tool) => tool.type === "function")
            .map((tool) => ({
              name: tool.function.name,
              description: tool.function.description,
              parameters: tool.function.parameters,
            })),
        },
      ]
    : undefined;

  return {
    contents,
    config: {
      systemInstruction:
        systemParts.length > 0 ? { parts: systemParts } : undefined,
      tools,
      responseMimeType:
        req.response_format?.type === "json_object"
          ? "application/json"
          : undefined,
    },
  };
}

function toGeminiContent(
  message: ChatCompletionMessageParam,
  toolCallNames: Map<string, string>,
): GeminiContent {
  if (message.role === "assistant") {
    const assistant = message as ChatCompletionAssistantMessageParam;
    const parts: GeminiPart[] = [];
    const text = contentToText(assistant.content);
    if (text) parts.push({ text });
    for (const toolCall of assistant.tool_calls ?? []) {
      if (toolCall.type !== "function") continue;
      toolCallNames.set(toolCall.id, toolCall.function.name);
      parts.push({
        functionCall: {
          name: toolCall.function.name,
          args: parseJson(toolCall.function.arguments),
        },
      });
    }
    return { role: "model", parts };
  }

  if (message.role === "tool") {
    return {
      role: "user",
      parts: [
        {
          functionResponse: {
            name:
              toolCallNames.get(message.tool_call_id) ?? message.tool_call_id,
            response: { result: message.content },
          },
        },
      ],
    };
  }

  return { role: "user", parts: contentToGeminiParts(message.content) };
}

function contentToGeminiParts(content: unknown): GeminiPart[] {
  if (typeof content === "string") return content ? [{ text: content }] : [];
  if (!Array.isArray(content)) return [];
  const parts: GeminiPart[] = [];
  for (const item of content as JsonRecord[]) {
    if (item.type === "text" && typeof item.text === "string") {
      parts.push({ text: item.text });
    } else if (item.type === "image_url") {
      const dataUrl = String((item.image_url as JsonRecord | undefined)?.url);
      const parsed = parseDataUrl(dataUrl);
      if (parsed) {
        parts.push({
          inlineData: { mimeType: parsed.mimeType, data: parsed.base64 },
        });
      }
    } else if (item.type === "file") {
      const file = item.file as JsonRecord | undefined;
      const parsed = parseDataUrl(String(file?.file_data ?? ""));
      if (parsed) {
        parts.push({
          inlineData: { mimeType: parsed.mimeType, data: parsed.base64 },
        });
      }
    }
  }
  return parts;
}

function fromGeminiResponse(
  model: string,
  response: JsonRecord,
): ChatCompletion {
  const candidate = ((response.candidates as JsonRecord[] | undefined)?.[0] ??
    {}) as JsonRecord;
  const content = (candidate.content as JsonRecord | undefined) ?? {};
  const parts = (content.parts as JsonRecord[] | undefined) ?? [];
  const textParts: string[] = [];
  const toolCalls = parts
    .map((part) => part.functionCall as JsonRecord | undefined)
    .filter(Boolean)
    .map((call) => ({
      id: String(call?.name ?? crypto.randomUUID()),
      type: "function" as const,
      function: {
        name: String(call?.name ?? ""),
        arguments: JSON.stringify(call?.args ?? {}),
      },
    }));

  for (const part of parts) {
    if (typeof part.text === "string") textParts.push(part.text);
  }

  const message: ChatCompletionMessage = {
    role: "assistant",
    content: textParts.join(""),
    refusal: null,
    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
  };
  return chatCompletion(model, message);
}

function toAnthropicRequest(req: ChatCompletionCreateParamsNonStreaming) {
  const system: string[] = [];
  const messages: { role: "user" | "assistant"; content: AnthropicBlock[] }[] =
    [];

  for (const message of req.messages) {
    if (message.role === "system") {
      const text = contentToText(message.content);
      if (text) system.push(text);
      continue;
    }
    messages.push(toAnthropicMessage(message));
  }
  if (req.response_format?.type === "json_object") {
    system.push("Return only a valid JSON object. Do not include markdown.");
  }

  return {
    model: req.model,
    max_tokens: 4096,
    system: system.join("\n\n") || undefined,
    messages,
    tools: req.tools?.map(toAnthropicTool).filter(Boolean),
  };
}

function toAnthropicMessage(message: ChatCompletionMessageParam): {
  role: "user" | "assistant";
  content: AnthropicBlock[];
} {
  if (message.role === "assistant") {
    const assistant = message as ChatCompletionAssistantMessageParam;
    const content: AnthropicBlock[] = [];
    const text = contentToText(assistant.content);
    if (text) content.push({ type: "text", text });
    for (const toolCall of assistant.tool_calls ?? []) {
      if (toolCall.type !== "function") continue;
      content.push({
        type: "tool_use",
        id: toolCall.id,
        name: toolCall.function.name,
        input: parseJson(toolCall.function.arguments),
      });
    }
    return { role: "assistant", content };
  }

  if (message.role === "tool") {
    return {
      role: "user",
      content: [
        {
          type: "tool_result",
          tool_use_id: message.tool_call_id,
          content: String(message.content ?? ""),
        },
      ],
    };
  }

  return { role: "user", content: contentToAnthropicBlocks(message.content) };
}

function contentToAnthropicBlocks(content: unknown): AnthropicBlock[] {
  if (typeof content === "string")
    return content ? [{ type: "text", text: content }] : [];
  if (!Array.isArray(content)) return [];
  const blocks: AnthropicBlock[] = [];
  for (const item of content as JsonRecord[]) {
    if (item.type === "text" && typeof item.text === "string") {
      blocks.push({ type: "text", text: item.text });
    } else if (item.type === "image_url") {
      const dataUrl = String((item.image_url as JsonRecord | undefined)?.url);
      const parsed = parseDataUrl(dataUrl);
      if (parsed) {
        blocks.push({
          type: "image",
          source: {
            type: "base64",
            media_type: parsed.mimeType,
            data: parsed.base64,
          },
        });
      }
    } else if (item.type === "file") {
      const file = item.file as JsonRecord | undefined;
      const parsed = parseDataUrl(String(file?.file_data ?? ""));
      if (!parsed) continue;
      if (parsed.mimeType.startsWith("text/")) {
        blocks.push({
          type: "text",
          text: `Attachment ${String(file?.filename ?? "file")}:\n${decodeBase64Text(parsed.base64)}`,
        });
      } else {
        blocks.push({
          type: "document",
          name: String(file?.filename ?? "file"),
          source: {
            type: "base64",
            media_type: parsed.mimeType,
            data: parsed.base64,
          },
        });
      }
    }
  }
  return blocks;
}

function toAnthropicTool(tool: ChatCompletionTool) {
  if (tool.type !== "function") return null;
  return {
    name: tool.function.name,
    description: tool.function.description,
    input_schema: tool.function.parameters,
  };
}

function fromAnthropicResponse(
  model: string,
  response: JsonRecord,
): ChatCompletion {
  const blocks = (response.content as JsonRecord[] | undefined) ?? [];
  const text = blocks
    .filter((block) => block.type === "text")
    .map((block) => String(block.text ?? ""))
    .join("");
  const toolCalls = blocks
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      id: String(block.id ?? crypto.randomUUID()),
      type: "function" as const,
      function: {
        name: String(block.name ?? ""),
        arguments: JSON.stringify(block.input ?? {}),
      },
    }));
  const message: ChatCompletionMessage = {
    role: "assistant",
    content: text,
    refusal: null,
    tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
  };
  return chatCompletion(model, message);
}

function chatCompletion(
  model: string,
  message: ChatCompletionMessage,
): ChatCompletion {
  return {
    id: crypto.randomUUID(),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        finish_reason: message.tool_calls?.length ? "tool_calls" : "stop",
        message,
        logprobs: null,
      },
    ],
  } as ChatCompletion;
}

async function openAIRealtimeWebSearch(
  getClient: () => Promise<OpenAI>,
  provider: Provider,
  request: RealtimeWebSearchRequest,
): Promise<RealtimeWebSearchResult> {
  try {
    const client = await getClient();
    const response = await client.responses.create({
      model: request.model,
      input: searchPrompt(request),
      tools: [{ type: "web_search" }],
      tool_choice: "required",
      include: ["web_search_call.action.sources"],
    } as never);
    const json = response as unknown as JsonRecord;
    return {
      answer:
        typeof json.output_text === "string"
          ? json.output_text
          : responseOutputText(json),
      sources: extractOpenAISources(json),
    };
  } catch (error) {
    throw normalizeProviderError(provider, error);
  }
}

async function anthropicRealtimeWebSearch(
  getClient: () => Promise<Anthropic>,
  provider: Provider,
  request: RealtimeWebSearchRequest,
): Promise<RealtimeWebSearchResult> {
  try {
    const client = await getClient();
    const response = await client.messages.create({
      model: request.model,
      max_tokens: 1024,
      messages: [{ role: "user", content: searchPrompt(request) }],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
    } as never);
    const json = response as unknown as JsonRecord;
    return {
      answer: anthropicText(json),
      sources: extractSourcesDeep(json),
    };
  } catch (error) {
    throw normalizeProviderError(provider, error);
  }
}

async function geminiRealtimeWebSearch(
  getClient: () => Promise<GoogleGenAI>,
  provider: Provider,
  request: RealtimeWebSearchRequest,
): Promise<RealtimeWebSearchResult> {
  try {
    const client = await getClient();
    const response = await client.models.generateContent({
      model: request.model,
      contents: searchPrompt(request),
      config: {
        tools: [{ googleSearch: {} }],
      },
    } as never);
    const json = response as unknown as JsonRecord;
    return {
      answer:
        typeof json.text === "string" ? json.text : responseCandidateText(json),
      sources: extractGeminiSources(json),
    };
  } catch (error) {
    throw normalizeProviderError(provider, error);
  }
}

function searchPrompt(request: RealtimeWebSearchRequest): string {
  return [
    "Search the web for current, verifiable information and answer concisely.",
    `Query: ${request.query}`,
    request.topic ? `Topic: ${request.topic}` : "",
    request.location ? `Location: ${request.location}` : "",
    "If a numeric value is relevant, include the exact value and units in the answer.",
  ]
    .filter(Boolean)
    .join("\n");
}

function responseOutputText(response: JsonRecord): string {
  const texts: string[] = [];
  for (const item of (response.output as JsonRecord[] | undefined) ?? []) {
    for (const content of (item.content as JsonRecord[] | undefined) ?? []) {
      if (typeof content.text === "string") texts.push(content.text);
    }
  }
  return texts.join("");
}

function anthropicText(response: JsonRecord): string {
  return ((response.content as JsonRecord[] | undefined) ?? [])
    .filter((block) => block.type === "text")
    .map((block) => String(block.text ?? ""))
    .join("");
}

function responseCandidateText(response: JsonRecord): string {
  const candidate = ((response.candidates as JsonRecord[] | undefined)?.[0] ??
    {}) as JsonRecord;
  const content = (candidate.content as JsonRecord | undefined) ?? {};
  return ((content.parts as JsonRecord[] | undefined) ?? [])
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("");
}

function extractOpenAISources(response: JsonRecord) {
  const sources: Array<{ title?: string; url: string }> = [];
  for (const item of (response.output as JsonRecord[] | undefined) ?? []) {
    if (item.type === "web_search_call") {
      const action = item.action as JsonRecord | undefined;
      for (const source of (action?.sources as JsonRecord[] | undefined) ??
        []) {
        if (typeof source.url === "string") sources.push({ url: source.url });
      }
    }
    for (const content of (item.content as JsonRecord[] | undefined) ?? []) {
      for (const annotation of (content.annotations as
        | JsonRecord[]
        | undefined) ?? []) {
        if (typeof annotation.url === "string") {
          sources.push({
            url: annotation.url,
            title:
              typeof annotation.title === "string"
                ? annotation.title
                : undefined,
          });
        }
      }
    }
  }
  return dedupeSources(sources);
}

function extractGeminiSources(response: JsonRecord) {
  const candidate = ((response.candidates as JsonRecord[] | undefined)?.[0] ??
    {}) as JsonRecord;
  const metadata = candidate.groundingMetadata as JsonRecord | undefined;
  const sources: Array<{ title?: string; url: string }> = [];
  for (const chunk of (metadata?.groundingChunks as JsonRecord[] | undefined) ??
    []) {
    const web = chunk.web as JsonRecord | undefined;
    if (typeof web?.uri === "string") {
      sources.push({
        url: web.uri,
        title: typeof web.title === "string" ? web.title : undefined,
      });
    }
  }
  return dedupeSources(sources);
}

function extractSourcesDeep(value: unknown) {
  const sources: Array<{ title?: string; url: string }> = [];
  const visit = (item: unknown) => {
    if (!item || typeof item !== "object") return;
    if (Array.isArray(item)) {
      for (const child of item) visit(child);
      return;
    }
    const record = item as JsonRecord;
    if (typeof record.url === "string") {
      sources.push({
        url: record.url,
        title: typeof record.title === "string" ? record.title : undefined,
      });
    }
    for (const child of Object.values(record)) visit(child);
  };
  visit(value);
  return dedupeSources(sources);
}

function dedupeSources(sources: Array<{ title?: string; url: string }>) {
  const byUrl = new Map<string, { title?: string; url: string }>();
  for (const source of sources) {
    if (!source.url || byUrl.has(source.url)) continue;
    byUrl.set(source.url, source);
  }
  return [...byUrl.values()];
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return (content as JsonRecord[])
    .map((item) => (item.type === "text" ? String(item.text ?? "") : ""))
    .filter(Boolean)
    .join("\n");
}

function parseDataUrl(dataUrl: string): {
  mimeType: string;
  base64: string;
} | null {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

function parseJson(raw: string | undefined): JsonRecord {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as JsonRecord)
      : {};
  } catch {
    return {};
  }
}

function decodeBase64Text(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function extractProviderMessage(json: JsonRecord): string {
  const error = json.error as JsonRecord | string | undefined;
  if (typeof error === "string") return error;
  if (error && typeof error.message === "string") return error.message;
  if (typeof json.message === "string") return json.message;
  return "";
}

function normalizeProviderError(provider: Provider, error: unknown): Error {
  const providerLabel = aiProviders[provider]?.label ?? provider;
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "The provider rejected this request.";
  return new Error(`${providerLabel}: ${raw}`);
}
