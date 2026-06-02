import { createStore, get, set } from "idb-keyval";
import type { Provider, ProviderConfig } from "@/lib/aiProviders.ts";

const llmSettingsStore = createStore("hissab-inline", "inline-llm-settings");

export function saveLLMSettingsToIDB(llm: Provider, setting: ProviderConfig) {
  return set(llm, setting, llmSettingsStore);
}

export function getLLMSettingsFromIDB(
  llm: Provider,
): Promise<ProviderConfig | undefined> {
  return get(llm, llmSettingsStore);
}

export function saveCurrentLLMToIDB(llm: Provider) {
  return set("current-inline-llm", llm, llmSettingsStore);
}

export function getCurrentLLMFromIDB(): Promise<Provider | undefined> {
  return get("current-inline-llm", llmSettingsStore);
}

export function saveDefaultModelToIDB(model: string) {
  return set("current-llm-model", model, llmSettingsStore);
}

export function getDefaultModelFromIDB(): Promise<string | undefined> {
  return get("current-llm-model", llmSettingsStore);
}
