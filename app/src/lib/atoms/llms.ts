import { atom } from "jotai";
import { loadable } from "jotai/utils";
import {
  aiProviders,
  DEFAULT_PROVIDER_CONFIG,
  PROVIDERS,
  type Provider,
  type ProviderConfig,
  type ProviderSdk,
} from "@/lib/aiProviders.ts";
import {
  getCurrentLLMFromIDB,
  getDefaultModelFromIDB,
  getLLMSettingsFromIDB,
  saveCurrentLLMToIDB,
  saveDefaultModelToIDB,
  saveLLMSettingsToIDB,
} from "@/lib/idb-stores/settings-store";
import type { LLMClient } from "@/lib/llmClient.ts";
import { createProviderClient } from "@/lib/providerAdapters.ts";

const DEFAULT_PROVIDER: Provider = "openai";

export type ModelSelection = {
  provider: Provider;
  model: string;
};

function isProvider(value: string): value is Provider {
  return (PROVIDERS as readonly string[]).includes(value);
}

function isProviderSdk(value: unknown): value is ProviderSdk {
  return value === "openai" || value === "anthropic" || value === "gemini";
}

export function resolveModelSelection(
  selectedModel: string,
  fallbackProvider: Provider = DEFAULT_PROVIDER,
): ModelSelection {
  const separator = selectedModel.indexOf(":");
  if (separator > 0) {
    const provider = selectedModel.slice(0, separator);
    if (isProvider(provider)) {
      return {
        provider,
        model: selectedModel.slice(separator + 1),
      };
    }
  }

  return {
    provider: fallbackProvider,
    model: selectedModel,
  };
}

export function modelIdForRequest(
  selectedModel: string,
  fallbackModel = "gpt-4o",
): string {
  return resolveModelSelection(selectedModel).model || fallbackModel;
}

function makeDefaultSettings(): Record<Provider, ProviderConfig> {
  const out: Record<Provider, ProviderConfig> = {} as Record<
    Provider,
    ProviderConfig
  >;
  for (const provider of PROVIDERS) {
    out[provider] = { ...DEFAULT_PROVIDER_CONFIG };
  }
  return out;
}

function normalizeConfig(
  cfg: Partial<ProviderConfig> | undefined,
): ProviderConfig {
  return {
    apiKey: cfg?.apiKey ?? "",
    apiBaseUrl: cfg?.apiBaseUrl ?? "",
    sdk: isProviderSdk(cfg?.sdk) ? cfg.sdk : "openai",
    enabledModels: cfg?.enabledModels ?? [],
    customModels: cfg?.customModels ?? [],
    discoveredModels: cfg?.discoveredModels ?? [],
    modelsFetchedAt: cfg?.modelsFetchedAt ?? null,
  };
}

/* ---------- LLM Settings ---------- */

const llmSettingsDataAtom = atom<Record<Provider, ProviderConfig> | null>(null);

let llmSettingsLoadPromise: Promise<Record<Provider, ProviderConfig>> | null =
  null;
const loadLLMSettings = async (): Promise<Record<Provider, ProviderConfig>> => {
  const initial = makeDefaultSettings();
  for (const provider of PROVIDERS) {
    const stored = await getLLMSettingsFromIDB(provider);
    initial[provider] = normalizeConfig(stored);
  }
  return initial;
};

export const asyncLLMSettingsAtom = atom<
  Record<Provider, ProviderConfig> | Promise<Record<Provider, ProviderConfig>>,
  [Record<Provider, ProviderConfig>],
  void
>(
  (get) => {
    const cached = get(llmSettingsDataAtom);
    if (cached !== null) return cached;
    if (!llmSettingsLoadPromise) {
      llmSettingsLoadPromise = loadLLMSettings();
    }
    return llmSettingsLoadPromise;
  },
  async (_get, set, updatedSettings: Record<Provider, ProviderConfig>) => {
    for (const provider of PROVIDERS) {
      const currentSettings = await getLLMSettingsFromIDB(provider);
      const newSettings = updatedSettings[provider];
      const prev = normalizeConfig(currentSettings);
      const changed =
        prev.apiKey !== newSettings.apiKey ||
        prev.apiBaseUrl !== newSettings.apiBaseUrl ||
        prev.sdk !== newSettings.sdk ||
        JSON.stringify(prev.enabledModels) !==
          JSON.stringify(newSettings.enabledModels) ||
        JSON.stringify(prev.customModels) !==
          JSON.stringify(newSettings.customModels) ||
        JSON.stringify(prev.discoveredModels) !==
          JSON.stringify(newSettings.discoveredModels) ||
        prev.modelsFetchedAt !== newSettings.modelsFetchedAt;
      if (changed) {
        await saveLLMSettingsToIDB(provider, newSettings);
      }
    }
    set(llmSettingsDataAtom, updatedSettings);
  },
);

export const llmSettingsAtom = loadable(asyncLLMSettingsAtom);

/* ---------- Current LLM (provider) ---------- */

const currentLLMDataAtom = atom<Provider | null>(null);

let currentLLMLoadPromise: Promise<Provider> | null = null;
const loadCurrentLLM = async (): Promise<Provider> => {
  try {
    const stored = await getCurrentLLMFromIDB();
    return stored ?? DEFAULT_PROVIDER;
  } catch {
    return DEFAULT_PROVIDER;
  }
};

export const asyncCurrentLLMAtom = atom<
  Provider | Promise<Provider>,
  [Provider],
  void
>(
  (get) => {
    const cached = get(currentLLMDataAtom);
    if (cached !== null) return cached;
    if (!currentLLMLoadPromise) {
      currentLLMLoadPromise = loadCurrentLLM();
    }
    return currentLLMLoadPromise;
  },
  async (_get, set, next: Provider) => {
    await saveCurrentLLMToIDB(next);
    set(currentLLMDataAtom, next);
  },
);

export const currentLLMAtom = loadable(asyncCurrentLLMAtom);

/* ---------- Default model (provider:modelValue) ---------- */

const defaultModelDataAtom = atom<string | null>(null);

let defaultModelLoadPromise: Promise<string> | null = null;
const loadDefaultModel = async (): Promise<string> => {
  try {
    const stored = await getDefaultModelFromIDB();
    return stored ?? "";
  } catch {
    return "";
  }
};

export const asyncDefaultModelAtom = atom<
  string | Promise<string>,
  [string],
  void
>(
  (get) => {
    const cached = get(defaultModelDataAtom);
    if (cached !== null) return cached;
    if (!defaultModelLoadPromise) {
      defaultModelLoadPromise = loadDefaultModel();
    }
    return defaultModelLoadPromise;
  },
  async (_get, set, next: string) => {
    await saveDefaultModelToIDB(next);
    set(defaultModelDataAtom, next);
  },
);

export const defaultModelAtom = loadable(asyncDefaultModelAtom);

export const asyncLLMClientAtom = atom<Promise<LLMClient>>(async (get) => {
  try {
    const currentProvider: Provider = await get(asyncCurrentLLMAtom);
    const selectedModel = await get(asyncDefaultModelAtom);
    const llmSettings: Record<Provider, ProviderConfig> =
      await get(asyncLLMSettingsAtom);
    const { provider } = resolveModelSelection(selectedModel, currentProvider);
    const cfg = llmSettings[provider];
    return createProviderClient(provider, cfg);
  } catch (error) {
    console.error("Error creating LLM client:", error);
    throw error;
  }
});

export const llmClientAtom = loadable(asyncLLMClientAtom);

/* ---------- Backwards-compat aliases (used by existing consumers) ---------- */
export const inlineLLMClientAtom = llmClientAtom;
export const asyncInlineLLMClientAtom = asyncLLMClientAtom;
