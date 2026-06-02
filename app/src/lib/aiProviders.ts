export const PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "deepseek",
  "custom",
] as const;
export type Provider = (typeof PROVIDERS)[number];

export type ModelOption = {
  label: string;
  value: string;
  tier?: "flagship" | "fast";
  note?: string;
};

export type ProviderSdk = "openai" | "anthropic" | "gemini";

export type ProviderConfig = {
  apiKey: string;
  apiBaseUrl: string;
  sdk: ProviderSdk;
  enabledModels: string[];
  customModels: { label: string; value: string }[];
  discoveredModels: ModelOption[];
  modelsFetchedAt: number | null;
};

export type AiProvider = {
  label: string;
  url?: string;
  apiBaseUrl?: string;
  models?: ModelOption[];
  logo: string;
  custom?: boolean;
};

export const aiProviders: Record<Provider, AiProvider> = {
  openai: {
    label: "OpenAI",
    url: "https://openai.com",
    apiBaseUrl: "https://api.openai.com/v1",
    logo: "/provider-logos/openai.svg",
    models: [
      { label: "GPT-5.5", value: "gpt-5.5", tier: "flagship" },
      { label: "GPT-5.4", value: "gpt-5.4", tier: "flagship" },
      {
        label: "GPT-5.4 mini",
        value: "gpt-5.4-mini",
        tier: "fast",
        note: "Lower latency and cost",
      },
      {
        label: "GPT-5.4 nano",
        value: "gpt-5.4-nano",
        tier: "fast",
        note: "Lowest cost",
      },
    ],
  },
  anthropic: {
    label: "Anthropic",
    url: "https://www.anthropic.com",
    apiBaseUrl: "https://api.anthropic.com/v1",
    logo: "/provider-logos/anthropic.svg",
    models: [
      {
        label: "Claude Opus 4.8",
        value: "claude-opus-4-8",
        tier: "flagship",
      },
      {
        label: "Claude Sonnet 4.6",
        value: "claude-sonnet-4-6",
        tier: "flagship",
        note: "Recommended",
      },
      {
        label: "Claude Haiku 4.5",
        value: "claude-haiku-4-5-20251001",
        tier: "fast",
        note: "Fastest",
      },
    ],
  },
  gemini: {
    label: "Google Gemini",
    url: "https://ai.google.dev",
    apiBaseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
    logo: "/provider-logos/gemini.svg",
    models: [
      {
        label: "Gemini 3.1 Pro Preview",
        value: "gemini-3.1-pro-preview",
        tier: "flagship",
      },
      {
        label: "Gemini 3.5 Flash",
        value: "gemini-3.5-flash",
        tier: "flagship",
      },
      {
        label: "Gemini 3 Flash Preview",
        value: "gemini-3-flash-preview",
        tier: "fast",
        note: "Preview",
      },
      {
        label: "Gemini 3.1 Flash-Lite",
        value: "gemini-3.1-flash-lite",
        tier: "fast",
      },
    ],
  },
  deepseek: {
    label: "DeepSeek",
    url: "https://deepseek.com",
    apiBaseUrl: "https://api.deepseek.com/v1",
    logo: "/provider-logos/deepseek.svg",
    models: [
      { label: "DeepSeek V4 Pro", value: "deepseek-v4-pro", tier: "flagship" },
      {
        label: "DeepSeek V4 Flash",
        value: "deepseek-v4-flash",
        tier: "fast",
        note: "Thinking by default",
      },
    ],
  },
  custom: {
    label: "Custom endpoint",
    logo: "/provider-logos/custom.svg",
    custom: true,
  },
};

export const DEFAULT_PROVIDER_CONFIG: ProviderConfig = {
  apiKey: "",
  apiBaseUrl: "",
  sdk: "openai",
  enabledModels: [],
  customModels: [],
  discoveredModels: [],
  modelsFetchedAt: null,
};
