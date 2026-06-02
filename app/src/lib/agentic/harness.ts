import { Functions, Operators, Units } from "@rawbytes/hissab";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import type { Provider } from "@/lib/aiProviders.ts";
import {
  fileAsDataUrl,
  fileTextContent,
  type StoredNotebookFile,
} from "@/lib/idb-stores/file-store.ts";
import type { LLMClient } from "@/lib/llmClient.ts";
import type { MCPToolDispatch } from "@/lib/mcp/types.ts";
import { calculateExpressions } from "../../../../lib/calculateExpressions.ts";
import {
  baseDocumentation,
  getDocumentationChunk,
  OPERATION_TAGS,
  type OperationTag,
} from "../../../../lib/documentation";
import type {
  AIFormatResponseType,
  ClarificationInput,
  ExpWithResult,
  SolutionPlan,
  SolutionStep,
} from "../../../../lib/types/AITypes.ts";
import { parseJsonObject } from "./json.ts";
import {
  bestEffortSynthesisInstructions,
  classifyAndDecomposeInstructions,
  explainSolutionInstructions,
  sanityCheckInstructions,
  solverLoopInstructions,
  synthesizeDocsAnswerInstructions,
  synthesizeFastPathInstructions,
} from "./prompts.ts";
import type {
  AgentProgressCallback,
  Classification,
  ClassificationCalculateComplex,
  ClassificationCalculateSimple,
} from "./types.ts";

export type AgentHistoryMessage = ChatCompletionMessageParam;

const MAX_SOLVER_ITERATIONS = 12;
const FAST_PATH_OPERATION_TAGS = new Set<OperationTag>([
  "arithmetic",
  "percentage",
]);

function withExtraInstructions(base: string, extra?: string): string {
  return extra && extra.trim() ? `${base}\n\n---\n\n${extra.trim()}` : base;
}

export interface AgenticOptions {
  client: LLMClient;
  model: string;
  userPrompt: string;
  history?: ChatCompletionMessageParam[];
  onProgress?: AgentProgressCallback;
  files?: StoredNotebookFile[];
  mcpTools?: ChatCompletionTool[];
  mcpDispatch?: Map<string, MCPToolDispatch>;
  extraSystemInstructions?: string;
}

const fetchDocsTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "fetch_hissab_docs",
    description:
      "Fetch Hissab documentation for one or more operation categories, optionally including the operation catalog. Call this before writing expressions for an operation you are not confident about.",
    parameters: {
      type: "object",
      properties: {
        tags: {
          type: "array",
          description: "Operation categories whose documentation you need.",
          items: {
            type: "string",
            enum: OPERATION_TAGS as unknown as string[],
          },
        },
        include_catalog: {
          type: "boolean",
          description:
            "Whether to include the base Hissab documentation and operation catalog.",
        },
      },
    },
  },
};

const calculateTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "calculate_with_hissab",
    description:
      "Evaluate Hissab expressions. Pass related expressions in one call so they can share state via snake_case labels and the 'prev' keyword. Each result includes an 'errorMessage' when the expression failed.",
    parameters: {
      type: "object",
      properties: {
        expressions: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["expressions"],
    },
  },
};

const realtimeWebSearchTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "realtime_web_search",
    description:
      "Search the web through the selected provider's hosted search API for current public information, returning a concise answer and source URLs. Use this before calculating with current exchange rates, stocks, crypto, weather, news, or recent data.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The specific current-data lookup to perform.",
        },
        topic: {
          type: "string",
          enum: ["general", "currency", "stock", "weather", "crypto", "news"],
        },
        location: {
          type: "string",
          description: "Optional location for weather or local results.",
        },
      },
      required: ["query"],
    },
  },
};

const lookupNamesTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "lookup_hissab_names",
    description:
      "Check whether unit or function names are valid Hissab names and get the canonical spelling for misspelled or unknown ones. Use it when unsure a unit/function exists or after an 'unknown unit/function' error.",
    parameters: {
      type: "object",
      properties: {
        names: {
          type: "array",
          description: "Unit or function names to validate.",
          items: { type: "string" },
        },
      },
      required: ["names"],
    },
  },
};

const revisePlanTool: ChatCompletionTool = {
  type: "function",
  function: {
    name: "revise_plan",
    description:
      "Replace the working step plan when the original decomposition was wrong or incomplete (a missing intermediate, a step that should split, etc.). The recorded plan is reused to explain the solution later, so keep it accurate.",
    parameters: {
      type: "object",
      properties: {
        goal: { type: "string", description: "The final quantity to compute." },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              description: { type: "string" },
              method: {
                type: "string",
                description: "The formula or approach in plain math.",
              },
              depends_on: { type: "array", items: { type: "string" } },
              operation_tags: {
                type: "array",
                items: {
                  type: "string",
                  enum: OPERATION_TAGS as unknown as string[],
                },
              },
            },
            required: ["id", "description"],
          },
        },
      },
      required: ["steps"],
    },
  },
};

function fetchDocs(tags: OperationTag[], includeCatalog = false): string {
  const seen = new Set<OperationTag>();
  const chunks: string[] = [];
  if (includeCatalog || tags.length === 0) {
    chunks.push(baseDocumentation.trim());
  }
  for (const tag of tags) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    const chunk = getDocumentationChunk(tag);
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  return chunks.length > 0
    ? chunks.join("\n\n")
    : "(no documentation available for those tags)";
}

const KNOWN_UNIT_NAMES: ReadonlySet<string> = (() => {
  const names = new Set<string>();
  for (const [key, data] of Object.entries(Units)) {
    names.add(key.toLowerCase());
    const plural = (data as { plural?: string }).plural;
    if (plural) names.add(plural.toLowerCase());
  }
  return names;
})();

const KNOWN_FUNCTION_NAMES: ReadonlySet<string> = (() => {
  const names = new Set<string>();
  for (const key of Object.keys(Functions)) names.add(key.toLowerCase());
  // Trig/log/etc. are postfix operators in the engine, not Functions — include
  // the alphabetic ones so names like sin, cos, log10, sinh validate too.
  for (const key of Object.keys(Operators)) {
    if (/^[a-z][a-z0-9]*$/i.test(key)) names.add(key.toLowerCase());
  }
  return names;
})();

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const row = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = temp;
    }
  }
  return row[n];
}

function closestNames(
  name: string,
  pool: ReadonlySet<string>,
  max = 3,
): string[] {
  const scored: Array<{ name: string; d: number }> = [];
  for (const candidate of pool) {
    const d = levenshtein(name, candidate);
    const tolerance = Math.max(2, Math.floor(candidate.length / 3));
    if (
      d <= tolerance ||
      candidate.includes(name) ||
      (name.length >= 3 && name.includes(candidate))
    ) {
      scored.push({ name: candidate, d });
    }
  }
  scored.sort((x, y) => x.d - y.d);
  return scored.slice(0, max).map((s) => s.name);
}

type NameLookup = {
  name: string;
  recognized: boolean;
  kind?: "unit" | "function";
  description?: string;
  suggestions?: string[];
};

function suggestNames(lower: string): string[] {
  if (lower.length < 2) return [];
  return [
    ...closestNames(lower, KNOWN_UNIT_NAMES),
    ...closestNames(lower, KNOWN_FUNCTION_NAMES),
  ].slice(0, 5);
}

const PROBE_BARE_NUMBER = /^[\d.,\s-]*$/;

/**
 * Validate unit/function names against the engine — the single source of truth.
 * Functions and statically-known units (incl. dimensionless ones like ppm) are
 * matched directly; everything else is probed by evaluating `1 <name>`, which
 * echoes the unit when recognized (catching aliases, single-word shortcuts, and
 * compounds the static tables miss) and collapses to a bare number when not.
 * Never asserts a name is invalid — only "couldn't confirm" with suggestions.
 */
async function lookupHissabNames(rawNames: string[]): Promise<string> {
  const functionKeys = Object.keys(Functions);
  const names = [...new Set(rawNames.map((n) => String(n).trim()))]
    .filter(Boolean)
    .slice(0, 25);

  const byName = new Map<string, NameLookup>();
  const toProbe: string[] = [];

  for (const name of names) {
    const lower = name.toLowerCase();
    if (KNOWN_FUNCTION_NAMES.has(lower)) {
      const fnKey = functionKeys.find((k) => k.toLowerCase() === lower);
      const fnData = fnKey
        ? (Functions as Record<string, { description?: string }>)[fnKey]
        : undefined;
      byName.set(name, {
        name,
        recognized: true,
        kind: "function",
        ...(fnData?.description ? { description: fnData.description } : {}),
      });
    } else if (KNOWN_UNIT_NAMES.has(lower)) {
      byName.set(name, { name, recognized: true, kind: "unit" });
    } else {
      toProbe.push(name);
    }
  }

  if (toProbe.length > 0) {
    const probed = await calculateExpressions(toProbe.map((n) => `1 ${n}`));
    probed.forEach((res, i) => {
      const name = toProbe[i];
      const recognized = !res.error && !PROBE_BARE_NUMBER.test(res.result);
      byName.set(
        name,
        recognized
          ? { name, recognized: true, kind: "unit" }
          : {
              name,
              recognized: false,
              suggestions: suggestNames(name.toLowerCase()),
            },
      );
    });
  }

  return JSON.stringify({
    results: names.map((name) => byName.get(name)),
    note: "recognized=false does NOT mean the name is unusable: Hissab also accepts currencies, the `%` symbol, compound units (e.g. `meter/second`), and aliases. When recognized=false, prefer a suggestion or spell the unit in full. Note `m` means million (5m = 5,000,000), not meter.",
  });
}

function normalizeStep(value: unknown): SolutionStep | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.description !== "string") {
    return null;
  }
  return {
    id: raw.id,
    description: raw.description,
    method: typeof raw.method === "string" ? raw.method : undefined,
    depends_on: Array.isArray(raw.depends_on)
      ? raw.depends_on.filter((d): d is string => typeof d === "string")
      : [],
    operation_tags: parseOperationTags(raw.operation_tags),
  };
}

function normalizeSteps(value: unknown): SolutionStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeStep)
    .filter((step): step is SolutionStep => step !== null);
}

function isOperationTag(value: unknown): value is OperationTag {
  return (
    typeof value === "string" && OPERATION_TAGS.includes(value as OperationTag)
  );
}

function parseOperationTags(value: unknown): OperationTag[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isOperationTag);
}

function parseSearchTopic(
  value: unknown,
):
  | "general"
  | "currency"
  | "stock"
  | "weather"
  | "crypto"
  | "news"
  | undefined {
  return value === "general" ||
    value === "currency" ||
    value === "stock" ||
    value === "weather" ||
    value === "crypto" ||
    value === "news"
    ? value
    : undefined;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeClarificationInput(
  value: unknown,
): ClarificationInput | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const label = cleanString(raw.label);
  const rawName = cleanString(raw.name) || label;
  const name = rawName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!name || !label) return null;

  const examples = Array.isArray(raw.examples)
    ? raw.examples
        .map((example) => cleanString(example))
        .filter((example) => example.length > 0)
        .slice(0, 5)
    : undefined;

  return {
    name,
    label,
    ...(cleanString(raw.reason) ? { reason: cleanString(raw.reason) } : {}),
    ...(cleanString(raw.expected_format)
      ? { expected_format: cleanString(raw.expected_format) }
      : {}),
    ...(examples && examples.length > 0 ? { examples } : {}),
  };
}

function normalizeClarificationInputs(value: unknown): ClarificationInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeClarificationInput)
    .filter((input): input is ClarificationInput => input !== null);
}

function normalizeClassification(value: unknown): Classification {
  if (!value || typeof value !== "object") {
    return { intent: "general", reply: "I couldn't understand that request." };
  }
  const raw = value as Record<string, unknown>;

  if (raw.intent === "general") {
    return {
      intent: "general",
      reply: typeof raw.reply === "string" ? raw.reply : "",
    };
  }
  if (raw.intent === "hissab_docs") {
    return {
      intent: "hissab_docs",
      question: typeof raw.question === "string" ? raw.question : "",
      operation_tags: parseOperationTags(raw.operation_tags),
      include_catalog:
        typeof raw.include_catalog === "boolean"
          ? raw.include_catalog
          : undefined,
    };
  }
  if (raw.intent === "needs_clarification") {
    const goal = cleanString(raw.goal) || "the calculation";
    const missingInputs = normalizeClarificationInputs(raw.missing_inputs);
    const fallbackQuestion =
      missingInputs.length > 0
        ? `Please provide ${missingInputs.map((input) => input.label).join(", ")}.`
        : "Please provide the missing information needed for this calculation.";
    return {
      intent: "needs_clarification",
      goal,
      missing_inputs: missingInputs,
      question: cleanString(raw.question) || fallbackQuestion,
    };
  }
  if (raw.intent === "calculate_simple") {
    return {
      intent: "calculate_simple",
      goal: typeof raw.goal === "string" ? raw.goal : "",
      operation_tags: parseOperationTags(raw.operation_tags),
      expressions: Array.isArray(raw.expressions)
        ? raw.expressions.filter(
            (exp): exp is string => typeof exp === "string",
          )
        : [],
    };
  }
  if (raw.intent === "calculate_complex") {
    return {
      intent: "calculate_complex",
      goal: typeof raw.goal === "string" ? raw.goal : "",
      steps: normalizeSteps(raw.steps),
    };
  }

  if (raw.is_math === false) {
    return {
      intent: "general",
      reply: typeof raw.reply === "string" ? raw.reply : "",
    };
  }
  if (raw.is_math === true && raw.is_simple === true) {
    return {
      intent: "calculate_simple",
      goal: typeof raw.goal === "string" ? raw.goal : "",
      operation_tags: ["arithmetic"],
      expressions: Array.isArray(raw.expressions)
        ? raw.expressions.filter(
            (exp): exp is string => typeof exp === "string",
          )
        : [],
    };
  }
  if (raw.is_math === true && raw.is_simple === false) {
    return {
      intent: "calculate_complex",
      goal: typeof raw.goal === "string" ? raw.goal : "",
      steps: normalizeSteps(raw.steps),
    };
  }

  return { intent: "general", reply: "I couldn't understand that request." };
}

async function classifyAndDecompose(
  client: LLMClient,
  model: string,
  userPrompt: string,
  history: ChatCompletionMessageParam[],
  fileMessage: ChatCompletionMessageParam | null,
  extraSystemInstructions?: string,
): Promise<Classification> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: withExtraInstructions(
        classifyAndDecomposeInstructions,
        extraSystemInstructions,
      ),
    },
    ...history,
  ];
  if (fileMessage) messages.push(fileMessage);
  messages.push({ role: "user", content: userPrompt });
  const response = await client.chat.completions.create({
    model,
    stream: false,
    response_format: { type: "json_object" },
    messages,
  });
  const content = response.choices[0]?.message?.content ?? "{}";
  return normalizeClassification(parseJsonObject(content));
}

async function synthesizeFastPath(
  client: LLMClient,
  model: string,
  userPrompt: string,
  goal: string,
  results: ExpWithResult[],
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    stream: false,
    messages: [
      { role: "system", content: synthesizeFastPathInstructions },
      {
        role: "user",
        content: `User prompt: ${userPrompt}\nGoal: ${goal}\nResults: ${JSON.stringify(
          results,
        )}`,
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

async function synthesizeDocsAnswer(
  client: LLMClient,
  model: string,
  userPrompt: string,
  question: string,
  docsContext: string,
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    stream: false,
    messages: [
      { role: "system", content: synthesizeDocsAnswerInstructions },
      {
        role: "user",
        content: `User prompt: ${userPrompt}\nQuestion: ${question}\n\nHissab documentation context:\n${docsContext}`,
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

async function synthesizeBestEffort(
  client: LLMClient,
  model: string,
  userPrompt: string,
  plan: SolutionPlan,
  results: ExpWithResult[],
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    stream: false,
    messages: [
      { role: "system", content: bestEffortSynthesisInstructions },
      {
        role: "user",
        content: `User prompt: ${userPrompt}\nPlan: ${JSON.stringify(
          plan,
        )}\nResults so far: ${JSON.stringify(results)}`,
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

async function sanityCheck(
  client: LLMClient,
  model: string,
  goal: string,
  answer: string,
  results: ExpWithResult[],
): Promise<string | null> {
  try {
    const response = await client.chat.completions.create({
      model,
      stream: false,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sanityCheckInstructions },
        {
          role: "user",
          content: `Goal: ${goal}\nProposed answer: ${answer}\nExpressions and results: ${JSON.stringify(
            results,
          )}`,
        },
      ],
    });
    const parsed = parseJsonObject(
      response.choices[0]?.message?.content ?? "{}",
    ) as { ok?: boolean; concern?: unknown };
    if (parsed.ok === false && typeof parsed.concern === "string") {
      return parsed.concern.trim() || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function explainSolution(
  client: LLMClient,
  model: string,
  userPrompt: string,
  plan: SolutionPlan | undefined,
  results: ExpWithResult[],
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    stream: false,
    messages: [
      { role: "system", content: explainSolutionInstructions },
      {
        role: "user",
        content: `User prompt: ${userPrompt}\nSolution plan: ${
          plan ? JSON.stringify(plan, null, 2) : "(none recorded)"
        }\n\nHissab expressions and results:\n${JSON.stringify(results, null, 2)}`,
      },
    ],
  });
  return response.choices[0]?.message?.content ?? "";
}

function canUseFastPath(
  classification: ClassificationCalculateSimple,
): boolean {
  return (
    classification.operation_tags.length > 0 &&
    classification.operation_tags.every((tag) =>
      FAST_PATH_OPERATION_TAGS.has(tag),
    )
  );
}

function complexFromSimple(
  classification: ClassificationCalculateSimple,
): ClassificationCalculateComplex {
  return {
    intent: "calculate_complex",
    goal: classification.goal,
    steps: [
      {
        id: "s1",
        description: `${classification.goal}. Candidate expression(s) from planner: ${classification.expressions.join("; ")}`,
        depends_on: [],
        operation_tags: classification.operation_tags,
      },
    ],
  };
}

function buildFileMessage(
  files: StoredNotebookFile[],
  provider: Provider,
): ChatCompletionMessageParam | null {
  if (files.length === 0) return null;
  const unsupported = files
    .map((file) => unsupportedAttachmentReason(provider, file))
    .find(Boolean);
  if (unsupported) throw new Error(unsupported);

  const content: unknown[] = [];
  for (const file of files) {
    const textContent = fileTextContent(file);
    if (
      textContent !== null &&
      (provider === "anthropic" ||
        provider === "deepseek" ||
        provider === "custom")
    ) {
      content.push({
        type: "text",
        text: `Attachment ${file.name} (${file.mimeType}):\n${textContent}`,
      });
      continue;
    }

    if (file.kind === "image") {
      content.push({
        type: "image_url",
        image_url: {
          url: fileAsDataUrl(file),
        },
      });
      continue;
    }

    content.push({
      type: "file",
      file: {
        filename: file.name,
        file_data: fileAsDataUrl(file),
      },
    });
  }

  return {
    role: "user",
    content: content as never,
  };
}

function unsupportedAttachmentReason(
  provider: Provider,
  file: StoredNotebookFile,
): string | null {
  const label = providerLabel(provider);
  if (provider === "openai") {
    if (file.kind === "audio" || file.kind === "video") {
      return `${label} does not support ${file.kind} attachments for this request. Try Gemini or remove ${file.name}.`;
    }
    return null;
  }
  if (provider === "gemini") {
    if (["document", "spreadsheet", "presentation"].includes(file.kind)) {
      return `${label} does not support ${file.kind} attachments in this notebook request yet. Try OpenAI or remove ${file.name}.`;
    }
    return null;
  }
  if (provider === "anthropic") {
    if (
      ["document", "spreadsheet", "presentation", "audio", "video"].includes(
        file.kind,
      )
    ) {
      return `${label} does not support ${file.kind} attachments for this request. Try Gemini/OpenAI or remove ${file.name}.`;
    }
    return null;
  }
  if (file.kind !== "text") {
    return `${label} does not support ${file.kind} attachments for this request. Remove ${file.name} or use OpenAI/Gemini.`;
  }
  return null;
}

function providerLabel(provider: Provider): string {
  if (provider === "openai") return "OpenAI";
  if (provider === "anthropic") return "Claude";
  if (provider === "gemini") return "Gemini";
  if (provider === "deepseek") return "DeepSeek";
  return "The selected provider";
}

export async function agenticSolve(
  opts: AgenticOptions,
): Promise<AIFormatResponseType> {
  const {
    client,
    model,
    userPrompt,
    history = [],
    onProgress,
    files = [],
    mcpTools = [],
    mcpDispatch,
    extraSystemInstructions,
  } = opts;

  const finalResponse: AIFormatResponseType = {
    naturalAnswer: "",
    expressions: [],
  };

  onProgress?.({ stage: "planning" });
  const fileMessage = buildFileMessage(files, client.provider ?? "openai");
  const classification = await classifyAndDecompose(
    client,
    model,
    userPrompt,
    history,
    fileMessage,
    extraSystemInstructions,
  );

  if (classification.intent === "general") {
    finalResponse.naturalAnswer = classification.reply;
    onProgress?.({ stage: "done" });
    return finalResponse;
  }

  if (classification.intent === "hissab_docs") {
    const tags = parseOperationTags(classification.operation_tags);
    const includeCatalog = classification.include_catalog ?? tags.length === 0;
    onProgress?.({
      stage: "fetching_docs",
      detail: tags.join(", ") || (includeCatalog ? "catalog" : undefined),
    });
    const docsContext = fetchDocs(tags, includeCatalog);
    onProgress?.({ stage: "synthesizing" });
    finalResponse.naturalAnswer = await synthesizeDocsAnswer(
      client,
      model,
      userPrompt,
      classification.question,
      docsContext,
    );
    onProgress?.({ stage: "done" });
    return finalResponse;
  }

  if (classification.intent === "needs_clarification") {
    finalResponse.naturalAnswer = classification.question;
    finalResponse.clarificationRequest = {
      goal: classification.goal,
      missing_inputs: classification.missing_inputs,
      question: classification.question,
    };
    onProgress?.({ stage: "done" });
    return finalResponse;
  }

  // Fast path: a trivial arithmetic/percentage calculation with no docs needed.
  // If any expression errors, fall through to the solver loop so it can repair.
  if (
    classification.intent === "calculate_simple" &&
    canUseFastPath(classification)
  ) {
    onProgress?.({
      stage: "calculating",
      detail: `${classification.expressions.length} expression${classification.expressions.length === 1 ? "" : "s"}`,
    });
    const results = await calculateExpressions(classification.expressions);
    if (!results.some((r) => r.error)) {
      finalResponse.expressions = results;
      onProgress?.({ stage: "synthesizing" });
      finalResponse.naturalAnswer = await synthesizeFastPath(
        client,
        model,
        userPrompt,
        classification.goal,
        results,
      );
      onProgress?.({ stage: "done" });
      return finalResponse;
    }
  }

  const complexPlan: ClassificationCalculateComplex =
    classification.intent === "calculate_complex"
      ? classification
      : complexFromSimple(classification);
  let currentPlan: SolutionPlan = {
    goal: complexPlan.goal,
    steps: complexPlan.steps,
  };
  const realtimeSearchSupported =
    typeof client.realtimeWebSearch === "function";
  const solverInstructions = realtimeSearchSupported
    ? solverLoopInstructions
    : `${solverLoopInstructions}\n\nRealtime web search is not available for the selected provider/model. If current public data is required, say realtime lookup failed instead of inventing values.`;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: withExtraInstructions(
        solverInstructions,
        extraSystemInstructions,
      ),
    },
    ...history,
  ];
  if (fileMessage) messages.push(fileMessage);
  messages.push(
    { role: "user", content: userPrompt },
    {
      role: "system",
      content: `Step plan:\n\`\`\`json\n${JSON.stringify(currentPlan, null, 2)}\n\`\`\``,
    },
  );

  const tools: ChatCompletionTool[] = [
    fetchDocsTool,
    lookupNamesTool,
    calculateTool,
    ...(realtimeSearchSupported ? [realtimeWebSearchTool] : []),
    revisePlanTool,
    ...mcpTools,
  ];

  onProgress?.({
    stage: "thinking",
    detail: `${currentPlan.steps.length} step${currentPlan.steps.length === 1 ? "" : "s"}`,
  });

  let sanityChecked = false;

  for (let i = 0; i < MAX_SOLVER_ITERATIONS; i++) {
    const response = await client.chat.completions.create({
      model,
      stream: false,
      tools,
      tool_choice: "auto",
      messages,
    });
    const responseMessage = response.choices[0].message;
    messages.push(responseMessage as ChatCompletionMessageParam);

    if (
      !responseMessage.tool_calls ||
      responseMessage.tool_calls.length === 0
    ) {
      const answer = responseMessage.content ?? "";
      // One semantic sanity check before finalizing a complex answer.
      if (!sanityChecked) {
        sanityChecked = true;
        onProgress?.({ stage: "thinking", detail: "sanity check" });
        const concern = await sanityCheck(
          client,
          model,
          currentPlan.goal,
          answer,
          finalResponse.expressions,
        );
        if (concern) {
          messages.push({
            role: "user",
            content: `Before finalizing, a reviewer flagged a possible issue: ${concern}. Re-check with the tools and correct the answer if it is wrong; otherwise confirm and restate the final answer.`,
          });
          continue;
        }
      }
      onProgress?.({ stage: "synthesizing" });
      finalResponse.naturalAnswer = answer;
      finalResponse.solutionPlan = currentPlan;
      onProgress?.({ stage: "done" });
      return finalResponse;
    }

    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.type !== "function") continue;
      const fnName = toolCall.function.name;
      let toolContent: string;

      try {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        if (fnName === "fetch_hissab_docs") {
          const tags = parseOperationTags(args.tags);
          const includeCatalog = Boolean(args.include_catalog);
          onProgress?.({
            stage: "fetching_docs",
            detail: tags.join(", ") || (includeCatalog ? "catalog" : undefined),
          });
          toolContent = fetchDocs(tags, includeCatalog);
        } else if (fnName === "lookup_hissab_names") {
          const names = Array.isArray(args.names)
            ? (args.names as unknown[]).map(String)
            : [];
          onProgress?.({ stage: "fetching_docs", detail: "validating names" });
          toolContent = await lookupHissabNames(names);
        } else if (fnName === "calculate_with_hissab") {
          const exprs = (args.expressions ?? []) as string[];
          onProgress?.({
            stage: "calculating",
            detail: `${exprs.length} expression${exprs.length === 1 ? "" : "s"}`,
          });
          const results = await calculateExpressions(exprs);
          finalResponse.expressions.push(...results);
          toolContent = JSON.stringify(results);
        } else if (fnName === "realtime_web_search") {
          if (!client.realtimeWebSearch) {
            toolContent =
              "Realtime lookup failed: selected provider/model does not support hosted web search.";
          } else {
            const query =
              typeof args.query === "string" ? args.query.trim() : "";
            if (!query) {
              toolContent = "Realtime lookup failed: query is required.";
            } else {
              const topic = parseSearchTopic(args.topic);
              const location =
                typeof args.location === "string" && args.location.trim()
                  ? args.location.trim()
                  : undefined;
              onProgress?.({
                stage: "searching_web",
                detail: topic ?? "current data",
              });
              const result = await client.realtimeWebSearch({
                model,
                query,
                topic,
                location,
              });
              const sourceText = result.sources
                .map((source) =>
                  source.title ? `${source.title}: ${source.url}` : source.url,
                )
                .join("\n");
              finalResponse.webSearchContext = [
                finalResponse.webSearchContext,
                `Query: ${query}\nAnswer: ${result.answer}\nSources:\n${sourceText}`,
              ]
                .filter(Boolean)
                .join("\n\n");
              toolContent = JSON.stringify(result);
            }
          }
        } else if (fnName === "revise_plan") {
          const steps = normalizeSteps(args.steps);
          const goal =
            typeof args.goal === "string" && args.goal.trim()
              ? args.goal.trim()
              : currentPlan.goal;
          currentPlan = {
            goal,
            steps: steps.length > 0 ? steps : currentPlan.steps,
          };
          onProgress?.({ stage: "planning" });
          toolContent = `Plan updated:\n${JSON.stringify(currentPlan, null, 2)}`;
        } else if (mcpDispatch?.has(fnName)) {
          onProgress?.({ stage: "calling_tool", detail: fnName });
          toolContent = await mcpDispatch.get(fnName)!(args);
        } else {
          toolContent = `Unknown tool: ${fnName}`;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toolContent = `Tool error: ${message}`;
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: toolContent,
      });
    }

    onProgress?.({ stage: "thinking" });
  }

  // Ran out of steps — synthesize a best-effort answer from what was computed
  // instead of discarding the work.
  onProgress?.({ stage: "synthesizing" });
  finalResponse.naturalAnswer = await synthesizeBestEffort(
    client,
    model,
    userPrompt,
    currentPlan,
    finalResponse.expressions,
  );
  finalResponse.solutionPlan = currentPlan;
  onProgress?.({ stage: "done" });
  return finalResponse;
}
