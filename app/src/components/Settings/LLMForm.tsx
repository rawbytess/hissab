import { useAtom, useSetAtom } from "jotai";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  aiProviders,
  PROVIDERS,
  type ModelOption,
  type Provider,
  type ProviderConfig,
  type ProviderSdk,
} from "@/lib/aiProviders.ts";
import {
  asyncDefaultModelAtom,
  asyncLLMSettingsAtom,
  defaultModelAtom,
  llmSettingsAtom,
} from "@/lib/atoms/llms.ts";
import { discoverProviderModels } from "@/lib/providerModelDiscovery.ts";

type PillStatus = "ok" | "empty" | "checking" | "error";
type RefreshStatus = "idle" | "loading" | "success" | "error";
const MODEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const CUSTOM_SDK_OPTIONS: Array<{
  value: ProviderSdk;
  label: string;
  hint: string;
}> = [
  {
    value: "openai",
    label: "OpenAI-compatible",
    hint: "Chat Completions / Responses",
  },
  { value: "anthropic", label: "Anthropic", hint: "Messages API" },
  { value: "gemini", label: "Gemini", hint: "GenAI API" },
];

function ConnectionPill({ status }: { status: PillStatus }) {
  if (status === "ok")
    return (
      <span className="pill ok">
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "currentColor",
          }}
        />
        Connected
      </span>
    );
  if (status === "checking")
    return (
      <span className="pill checking">
        <RefreshCw size={9} style={{ animation: "spin 1s linear infinite" }} />
        Testing
      </span>
    );
  if (status === "error") return <span className="pill error">Error</span>;
  return (
    <span className="pill empty">
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
        }}
      />
      Not configured
    </span>
  );
}

function formatFetchedAt(value: number) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to refresh models.";
}

function normalizeModelName(value: string) {
  return value
    .replace(/^models\//, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function hasDistinctModelId(model: ModelOption) {
  return normalizeModelName(model.label) !== normalizeModelName(model.value);
}

interface ProviderCardProps {
  provider: Provider;
  config: ProviderConfig;
  defaultModel: string;
  onChange: (patch: Partial<ProviderConfig>) => void;
  onToggleEnabled: (value: string) => void;
  onSetDefault: (composite: string) => void;
}

function ProviderCard({
  provider,
  config,
  defaultModel,
  onChange,
  onToggleEnabled,
  onSetDefault,
}: ProviderCardProps) {
  const meta = aiProviders[provider];
  const [open, setOpen] = useState(!!config.apiKey);
  const [revealKey, setRevealKey] = useState(false);
  const [pillStatus, setPillStatus] = useState<PillStatus>(
    config.apiKey ? "ok" : "empty",
  );
  const [statusDetail, setStatusDetail] = useState(
    config.apiKey ? "API key saved" : "",
  );
  const [refreshStatus, setRefreshStatus] = useState<RefreshStatus>("idle");
  const [refreshError, setRefreshError] = useState("");
  const autoRefreshKeyRef = useRef("");
  const keyRef = useRef<HTMLInputElement>(null);

  const handleTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    const key = keyRef.current?.value ?? config.apiKey;
    if (!key) return;
    setPillStatus("checking");
    setStatusDetail("Testing connection…");
    setTimeout(() => {
      onChange({ apiKey: key });
      setPillStatus("ok");
      setStatusDetail("API key saved");
    }, 900);
  };

  const handleKeyBlur = () => {
    const key = keyRef.current?.value ?? "";
    if (key !== config.apiKey) {
      onChange({ apiKey: key });
      setPillStatus(key ? "ok" : "empty");
      setStatusDetail(key ? "API key saved" : "");
    }
  };

  const refreshModels = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (provider === "custom") return;

    const key = keyRef.current?.value ?? config.apiKey;
    if (!key) {
      setRefreshStatus("error");
      setRefreshError("Add an API key before refreshing models.");
      return;
    }

    setRefreshStatus("loading");
    setRefreshError("");
    try {
      const discoveredModels = await discoverProviderModels(provider, {
        ...config,
        apiKey: key,
      });
      onChange({
        apiKey: key,
        discoveredModels,
        modelsFetchedAt: Date.now(),
      });
      setRefreshStatus("success");
      setStatusDetail(`${discoveredModels.length} models fetched`);
    } catch (error) {
      setRefreshStatus("error");
      setRefreshError(errorMessage(error));
    }
  };

  useEffect(() => {
    if (provider === "custom" || !open || !config.apiKey) return;
    const isStale =
      !config.modelsFetchedAt ||
      Date.now() - config.modelsFetchedAt > MODEL_CACHE_TTL_MS;
    if (!isStale) return;
    const refreshKey = `${provider}:${config.apiKey}:${config.modelsFetchedAt ?? "empty"}`;
    if (autoRefreshKeyRef.current === refreshKey) return;
    autoRefreshKeyRef.current = refreshKey;
    void refreshModels();
  }, [provider, open, config.apiKey, config.modelsFetchedAt]);

  const presetModels = meta.models ?? [];
  const discoveredModels = config.discoveredModels ?? [];
  const baseModels =
    discoveredModels.length > 0 ? discoveredModels : presetModels;
  const missingEnabledModels: ModelOption[] = config.enabledModels
    .filter((value) => !baseModels.some((model) => model.value === value))
    .map((value) => {
      const fallback = presetModels.find((model) => model.value === value);
      return {
        label: fallback?.label ?? value,
        value,
        note:
          discoveredModels.length > 0
            ? "Enabled, not returned by latest refresh"
            : "Enabled, not in static fallback",
      };
    });
  const visibleModels = [...baseModels, ...missingEnabledModels];
  const flagship = visibleModels.filter((m) => m.tier === "flagship");
  const fast = visibleModels.filter((m) => m.tier === "fast");
  const other = visibleModels.filter((m) => !m.tier);

  const renderModelRow = (m: ModelOption) => {
    const composite = `${provider}:${m.value}`;
    const enabled = config.enabledModels.includes(m.value);
    const isDefault = defaultModel === composite;
    const isMissing =
      discoveredModels.length > 0 &&
      enabled &&
      !discoveredModels.some((model) => model.value === m.value);
    const showModelId = hasDistinctModelId(m);
    return (
      <div
        key={m.value}
        className={`model-row${isDefault ? " is-default" : ""}`}
      >
        <button
          type="button"
          className={`check${enabled ? " checked" : ""}${!config.apiKey ? " disabled" : ""}`}
          onClick={() => config.apiKey && onToggleEnabled(m.value)}
        >
          {enabled && "✓"}
        </button>
        <div>
          <div className="model-label">
            {m.label}
            {isDefault && (
              <span className="badges">
                <span className="bdg inline-bdg">
                  <Sparkles size={9} /> default
                </span>
              </span>
            )}
            {isMissing && (
              <span className="badges">
                <span className="bdg inline-bdg">not returned</span>
              </span>
            )}
            {showModelId && <span className="model-id">{m.value}</span>}
          </div>
          {m.note && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-3)",
                marginTop: 1,
              }}
            >
              {m.note}
            </div>
          )}
        </div>
        <div />
        <button
          type="button"
          title={isDefault ? "Default model" : "Set as default"}
          disabled={!enabled}
          onClick={() => enabled && onSetDefault(composite)}
          style={{
            height: 26,
            width: 26,
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDefault ? "var(--accent)" : "var(--text-3)",
            background: isDefault ? "var(--accent-faint)" : "transparent",
            opacity: enabled ? 1 : 0.4,
            cursor: enabled ? "pointer" : "not-allowed",
          }}
        >
          ✦
        </button>
      </div>
    );
  };

  const updateCustomModelAt = (
    idx: number,
    patch: { label?: string; value?: string },
  ) => {
    const next = config.customModels.map((m, i) =>
      i === idx ? { ...m, ...patch } : m,
    );
    onChange({ customModels: next });
  };

  const removeCustomModelAt = (idx: number) => {
    const removed = config.customModels[idx];
    const next = config.customModels.filter((_, i) => i !== idx);
    const enabled = removed
      ? config.enabledModels.filter((v) => v !== removed.value)
      : config.enabledModels;
    onChange({ customModels: next, enabledModels: enabled });
  };

  return (
    <div
      className={`prov-card${open ? " open" : ""}${pillStatus === "ok" ? " connected" : ""}`}
    >
      <button
        type="button"
        className="prov-head"
        style={{ width: "100%", textAlign: "left" }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mark">
          <img src={meta.logo} alt="" aria-hidden="true" />
        </span>
        <div className="info">
          <div className="name">
            <span>{meta.label}</span>
            {meta.url && (
              <span className="url">· {meta.url.replace("https://", "")}</span>
            )}
          </div>
          <div className="conn-row">
            <ConnectionPill status={pillStatus} />
            {statusDetail && <span className="summary">{statusDetail}</span>}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          {config.enabledModels.length > 0 && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-3)",
                fontFamily: "var(--font-mono)",
                marginRight: 4,
              }}
            >
              {config.enabledModels.length} enabled
            </span>
          )}
          <span className="chev">
            <ChevronRight size={14} />
          </span>
        </div>
      </button>

      {open && (
        <div className="prov-body" onClick={(e) => e.stopPropagation()}>
          {provider === "custom" && (
            <>
              <div>
                <div className="prov-field-label">
                  <span>SDK/protocol</span>
                  <span className="hint">
                    Select the API shape for this endpoint
                  </span>
                </div>
                <div className="prov-input-wrap">
                  <select
                    className="prov-input"
                    value={config.sdk}
                    onChange={(e) =>
                      onChange({ sdk: e.currentTarget.value as ProviderSdk })
                    }
                  >
                    {CUSTOM_SDK_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    color: "var(--text-3)",
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  {
                    CUSTOM_SDK_OPTIONS.find(
                      (option) => option.value === config.sdk,
                    )?.hint
                  }
                </div>
              </div>

              <div>
                <div className="prov-field-label">
                  <span>API base URL</span>
                  <span className="hint">
                    {config.sdk === "openai"
                      ? "Any OpenAI-compatible endpoint"
                      : "Optional provider-compatible endpoint"}
                  </span>
                </div>
                <div className="prov-input-wrap">
                  <input
                    className="prov-input"
                    defaultValue={config.apiBaseUrl}
                    placeholder={
                      config.sdk === "anthropic"
                        ? "https://api.anthropic.com"
                        : config.sdk === "gemini"
                          ? "https://generativelanguage.googleapis.com"
                          : "https://api.example.com/v1"
                    }
                    onBlur={(e) =>
                      onChange({ apiBaseUrl: e.currentTarget.value })
                    }
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <div className="prov-field-label">
              <span>API key</span>
            </div>
            <div className="prov-input-wrap">
              <input
                ref={keyRef}
                className="prov-input"
                type={revealKey ? "text" : "password"}
                defaultValue={config.apiKey}
                placeholder="sk-…"
                onBlur={handleKeyBlur}
              />
              <div className="prov-input-actions">
                <button
                  type="button"
                  className="prov-input-action"
                  onClick={() => setRevealKey((v) => !v)}
                  title={revealKey ? "Hide" : "Show"}
                >
                  {revealKey ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  type="button"
                  className="prov-input-action"
                  onClick={handleTest}
                  title="Test connection"
                  disabled={pillStatus === "checking"}
                >
                  <RefreshCw size={12} />
                  Test
                </button>
              </div>
            </div>
          </div>

          {pillStatus === "checking" && (
            <div className="prov-status-strip checking">
              <RefreshCw
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
              <span>Verifying key with {meta.label}…</span>
            </div>
          )}

          {provider === "custom" ? (
            <div className="models-section">
              <div className="prov-field-label">
                <span>Custom models</span>
                <button
                  type="button"
                  className="wb-btn ghost"
                  style={{ height: 26, padding: "0 8px", fontSize: 11.5 }}
                  onClick={() =>
                    onChange({
                      customModels: [
                        ...config.customModels,
                        { label: "", value: "" },
                      ],
                    })
                  }
                >
                  <Plus size={12} /> Add model
                </button>
              </div>
              {config.customModels.length === 0 ? (
                <div
                  style={{
                    padding: "16px 14px",
                    border: "1px dashed var(--line-2)",
                    borderRadius: 10,
                    textAlign: "center",
                    color: "var(--text-3)",
                    fontSize: 12,
                  }}
                >
                  No models yet. Add model IDs from this endpoint.
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {config.customModels.map((m, i) => {
                    const composite = `custom:${m.value}`;
                    const isDefault = defaultModel === composite;
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: custom models use index
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr 1fr auto auto",
                          gap: 6,
                          alignItems: "center",
                          background: "var(--bg-1)",
                          border: "1px solid var(--line-2)",
                          borderRadius: 8,
                          padding: "4px 6px 4px 10px",
                        }}
                      >
                        <input
                          className="prov-input"
                          placeholder="Display name"
                          defaultValue={m.label}
                          onBlur={(e) =>
                            updateCustomModelAt(i, {
                              label: e.currentTarget.value,
                            })
                          }
                          style={{ height: 30 }}
                        />
                        <input
                          className="prov-input"
                          placeholder="model-id"
                          defaultValue={m.value}
                          onBlur={(e) =>
                            updateCustomModelAt(i, {
                              value: e.currentTarget.value,
                            })
                          }
                          style={{ height: 30 }}
                        />
                        <button
                          type="button"
                          title={isDefault ? "Default model" : "Set as default"}
                          disabled={!m.value}
                          onClick={() => m.value && onSetDefault(composite)}
                          style={{
                            height: 26,
                            width: 26,
                            borderRadius: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isDefault
                              ? "var(--accent)"
                              : "var(--text-3)",
                            background: isDefault
                              ? "var(--accent-faint)"
                              : "transparent",
                          }}
                        >
                          ✦
                        </button>
                        <button
                          type="button"
                          className="wb-btn danger-ghost"
                          style={{ height: 26, padding: "0 7px" }}
                          onClick={() => removeCustomModelAt(i)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="models-section">
              <div className="prov-field-label" style={{ marginBottom: 0 }}>
                <span>Models</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {config.modelsFetchedAt && (
                    <span className="hint">
                      Updated {formatFetchedAt(config.modelsFetchedAt)}
                    </span>
                  )}
                  <button
                    type="button"
                    className="wb-btn ghost"
                    style={{ height: 26, padding: "0 8px", fontSize: 11.5 }}
                    disabled={!config.apiKey || refreshStatus === "loading"}
                    onClick={refreshModels}
                  >
                    <RefreshCw
                      size={12}
                      style={
                        refreshStatus === "loading"
                          ? { animation: "spin 1s linear infinite" }
                          : undefined
                      }
                    />
                    Refresh models
                  </button>
                </div>
              </div>
              <div
                style={{
                  color: "var(--text-3)",
                  fontSize: 11,
                  marginTop: 4,
                  marginBottom: 8,
                }}
              >
                Check to enable · pin one enabled model as default
              </div>
              {refreshStatus === "error" && refreshError && (
                <div className="prov-status-strip error">
                  <span>{refreshError}</span>
                </div>
              )}
              {refreshStatus === "loading" && (
                <div className="prov-status-strip checking">
                  <RefreshCw
                    size={14}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span>Fetching models from {meta.label}…</span>
                </div>
              )}
              <div className="models-tiers">
                {flagship.length > 0 && (
                  <div className="models-tier">
                    <div className="tier-head">
                      <Sparkles size={10} /> Flagship
                    </div>
                    {flagship.map(renderModelRow)}
                  </div>
                )}
                {fast.length > 0 && (
                  <div className="models-tier">
                    <div className="tier-head">
                      <Zap size={10} /> Fast & cheap
                    </div>
                    {fast.map(renderModelRow)}
                  </div>
                )}
                {other.length > 0 && (
                  <div className="models-tier">
                    <div className="tier-head">
                      <Sparkles size={10} /> Available
                    </div>
                    {other.map(renderModelRow)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LLMForm() {
  const [llmValue] = useAtom(llmSettingsAtom);
  const setLLM = useSetAtom(asyncLLMSettingsAtom);
  const [defaultModelValue] = useAtom(defaultModelAtom);
  const setDefaultModel = useSetAtom(asyncDefaultModelAtom);

  if (llmValue.state === "loading") return null;
  if (llmValue.state === "hasError") return null;
  const settings = llmValue.data;

  const defaultModel =
    defaultModelValue.state === "hasData" ? defaultModelValue.data : "";

  const updateProvider = (
    provider: Provider,
    patch: Partial<ProviderConfig>,
  ) => {
    setLLM({ ...settings, [provider]: { ...settings[provider], ...patch } });
  };

  const toggleEnabled = (provider: Provider, value: string) => {
    const cfg = settings[provider];
    const next = cfg.enabledModels.includes(value)
      ? cfg.enabledModels.filter((v) => v !== value)
      : [...cfg.enabledModels, value];
    updateProvider(provider, { enabledModels: next });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="usage-note" style={{ marginBottom: 14 }}>
        <span className="ico">
          <Sparkles size={13} />
        </span>
        <div>
          Connect a provider, then check which models you want available. Pin
          one model as your <b>default</b> — that's what the composer uses for
          new questions.
        </div>
      </div>

      {PROVIDERS.map((provider) => (
        <ProviderCard
          key={provider}
          provider={provider}
          config={settings[provider]}
          defaultModel={defaultModel}
          onChange={(patch) => updateProvider(provider, patch)}
          onToggleEnabled={(value) => toggleEnabled(provider, value)}
          onSetDefault={(composite) => setDefaultModel(composite)}
        />
      ))}
    </div>
  );
}
