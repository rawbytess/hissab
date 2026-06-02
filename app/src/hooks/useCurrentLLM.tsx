import { useAtom } from "jotai";
import type { Provider, ProviderConfig } from "@/lib/aiProviders.ts";
import { aiProviders, PROVIDERS } from "@/lib/aiProviders.ts";
import {
  currentLLMAtom,
  defaultModelAtom,
  llmSettingsAtom,
} from "@/lib/atoms/llms.ts";

export type EnabledModel = {
  provider: Provider;
  value: string;
  label: string;
  composite: string;
};

const DEFAULT_CONFIG: ProviderConfig = {
  apiKey: "",
  apiBaseUrl: "",
  sdk: "openai",
  enabledModels: [],
  customModels: [],
  discoveredModels: [],
  modelsFetchedAt: null,
};

export function useCurrentLLM() {
  const [currentLLMValue] = useAtom(currentLLMAtom);
  const [defaultModelValue] = useAtom(defaultModelAtom);
  const [llmSettingsValue] = useAtom(llmSettingsAtom);

  const currentLLM: Provider =
    currentLLMValue.state === "hasData" ? currentLLMValue.data : "openai";
  const defaultModel: string =
    defaultModelValue.state === "hasData" ? defaultModelValue.data : "";

  const settings =
    llmSettingsValue.state === "hasData" ? llmSettingsValue.data : null;

  const currentLLMConfig: ProviderConfig =
    settings?.[currentLLM] ?? DEFAULT_CONFIG;

  const enabledModels: EnabledModel[] = [];
  if (settings) {
    for (const provider of PROVIDERS) {
      const cfg = settings[provider];
      if (!cfg.apiKey) continue;
      if (provider === "custom") {
        for (const m of cfg.customModels) {
          if (!m.value) continue;
          if (
            cfg.enabledModels.length > 0 &&
            !cfg.enabledModels.includes(m.value)
          )
            continue;
          enabledModels.push({
            provider,
            value: m.value,
            label: m.label || m.value,
            composite: `${provider}:${m.value}`,
          });
        }
      } else {
        const discovered = cfg.discoveredModels ?? [];
        const presets = aiProviders[provider]?.models ?? [];
        for (const value of cfg.enabledModels) {
          const m =
            discovered.find((model) => model.value === value) ??
            presets.find((model) => model.value === value);
          enabledModels.push({
            provider,
            value,
            label: m?.label ?? value,
            composite: `${provider}:${value}`,
          });
        }
      }
    }
  }

  return {
    currentLLM,
    currentLLMConfig,
    defaultModel,
    enabledModels,
    /* backwards compat aliases */
    currentInlineLLM: currentLLM,
    currentInlineLLMConfig: currentLLMConfig,
    currentChatLLM: currentLLM,
    currentChatLLMConfig: currentLLMConfig,
    enabledChatModels: enabledModels,
  };
}
