import type { Store } from "jotai/vanilla/store";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import {
  asyncDefaultModelAtom,
  asyncLLMClientAtom,
  modelIdForRequest,
} from "@/lib/atoms/llms.ts";
import { asyncMCPServersAtom } from "@/lib/atoms/mcp.ts";
import type {
  AICellData,
  AppliedExpressionOperation,
  Cell,
  ExpressionsCell,
  Notebook,
  TraceStep,
} from "@/lib/atoms/notebooks.ts";
import {
  asyncNotebooksAtom,
  notebookProgressAtom,
} from "@/lib/atoms/notebooks.ts";
import { asyncSkillsAtom } from "@/lib/atoms/skills.ts";
import {
  getNotebookFileFromIDB,
  type StoredNotebookFile,
} from "@/lib/idb-stores/file-store.ts";
import type { LLMClient } from "@/lib/llmClient.ts";
import { mcpManager } from "@/lib/mcp/manager.ts";
import type { MCPServer, MCPToolDispatch } from "@/lib/mcp/types.ts";
import { calculateExpressions } from "../../../../lib/calculateExpressions.ts";
import type { ExpWithResult } from "../../../../lib/types/AITypes.ts";
import {
  type AgentHistoryMessage,
  agenticSolve,
  explainSolution,
} from "./harness.ts";
import { parseJsonObject } from "./json.ts";
import type { AgentProgressEvent } from "./types.ts";

type ProposedExpressionOperation =
  | {
      type: "create";
      content?: string;
      expressions?: string[];
      title?: string;
    }
  | {
      type: "update";
      cellId?: string;
      content?: string;
      expressions?: string[];
      title?: string;
    }
  | {
      type: "delete";
      cellId?: string;
    };

type ExpressionCellSummary = {
  cell: ExpressionsCell;
  results: ExpWithResult[];
};

export async function runNotebookAI(
  store: Store,
  notebookId: string,
  userPrompt: string,
): Promise<void> {
  const notebooks = await Promise.resolve(store.get(asyncNotebooksAtom));

  const notebook = notebooks.find((nb) => nb.id === notebookId);
  if (!notebook) return;

  const aiCellId = crypto.randomUUID();
  const now = Date.now();

  const newAiCellData: AICellData = {
    id: aiCellId,
    prompt: userPrompt,
    askedAt: now,
    status: "running",
    generatedCellIds: [],
    trace: [],
  };

  const aiBlockId = crypto.randomUUID();

  const updatedNotebook = {
    ...notebook,
    cells: [
      ...notebook.cells,
      { id: aiBlockId, kind: "ai" as const, aiCellId },
    ],
    aiCells: { ...notebook.aiCells, [aiCellId]: newAiCellData },
    updatedAt: now,
  };

  await store.set(
    asyncNotebooksAtom,
    notebooks.map((nb) => (nb.id === notebookId ? updatedNotebook : nb)),
  );

  store.set(notebookProgressAtom, (prev) => ({
    ...prev,
    [aiCellId]: {
      notebookId,
      aiCellId,
      stage: "planning",
      startedAt: now,
    },
  }));

  const trace: TraceStep[] = [];
  let progressWrite = Promise.resolve();

  const updateAiCell = (
    updater: (existing: AICellData) => AICellData,
  ): void => {
    progressWrite = progressWrite
      .then(async () => {
        const nbs = await Promise.resolve(store.get(asyncNotebooksAtom));
        await store.set(
          asyncNotebooksAtom,
          nbs.map((nb) => {
            if (nb.id !== notebookId) return nb;
            const existing = nb.aiCells[aiCellId];
            if (!existing || existing.status !== "running") return nb;
            return {
              ...nb,
              aiCells: {
                ...nb.aiCells,
                [aiCellId]: updater(existing),
              },
            };
          }),
        );
      })
      .catch((error) => {
        console.error("Failed to update notebook AI progress:", error);
      });
  };

  try {
    const client = await Promise.resolve(store.get(asyncLLMClientAtom));
    const model = modelIdForRequest(
      await Promise.resolve(store.get(asyncDefaultModelAtom)),
    );
    const history = await buildNotebookHistory(notebook);
    const files: StoredNotebookFile[] = (
      await Promise.all(
        (notebook.fileIds ?? []).map((id) => getNotebookFileFromIDB(id)),
      )
    ).filter((file): file is StoredNotebookFile => Boolean(file));

    const enabledServers = (
      await Promise.resolve(store.get(asyncMCPServersAtom))
    ).filter((s) => s.enabled);
    const enabledSkills = (
      await Promise.resolve(store.get(asyncSkillsAtom))
    ).filter((s) => s.enabled);
    const { mcpTools, mcpDispatch } = await buildMCPTools(enabledServers);
    const extraSystemInstructions =
      enabledSkills.length > 0
        ? enabledSkills
            .map((s) => `# Skill: ${s.name}\n${s.instructions}`)
            .join("\n\n---\n\n")
        : undefined;

    const result = await agenticSolve({
      client,
      model,
      userPrompt,
      history,
      files,
      mcpTools,
      mcpDispatch,
      extraSystemInstructions,
      onProgress: (event: AgentProgressEvent) => {
        const stepT = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        if (event.stage !== "done") {
          const existingActive = trace.findIndex((s) => s.state === "active");
          if (existingActive >= 0) trace[existingActive].state = "done";
          trace.push({
            stage: event.stage,
            label: STAGE_LABELS[event.stage] ?? event.stage,
            detail: event.detail,
            t: stepT,
            state: "active",
          });
        }

        store.set(notebookProgressAtom, (prev) => ({
          ...prev,
          [aiCellId]: {
            notebookId,
            aiCellId,
            stage: event.stage,
            detail: event.detail,
            startedAt: now,
          },
        }));

        updateAiCell((existing) => ({
          ...existing,
          currentStage: event.stage,
          currentDetail: event.detail,
          trace: [...trace],
        }));
      },
    });

    const generatedContent = result.expressions
      .map((item) => item.expression)
      .filter((expression) => expression.trim().length > 0)
      .join("\n");
    const fallbackExpressionContent = result.clarificationRequest
      ? ""
      : generatedContent;
    const proposedOperations = result.clarificationRequest
      ? []
      : await proposeExpressionOperations(
          client,
          model,
          userPrompt,
          result.naturalAnswer,
          result.expressions,
          notebook,
          history,
        ).catch((error) => {
          console.error("Failed to plan notebook expression operations:", error);
          return [];
        });

    const finalTrace = trace.map((s) => ({ ...s, state: "done" as const }));
    await progressWrite;

    const finalNbs = await Promise.resolve(store.get(asyncNotebooksAtom));
    await store.set(
      asyncNotebooksAtom,
      finalNbs.map((nb) => {
        if (nb.id !== notebookId) return nb;
        const existing = nb.aiCells[aiCellId];
        if (!existing) return nb;
        const { cells, aiCells, appliedOps, generatedCellIds } =
          applyExpressionOperations(
            nb.cells,
            nb.aiCells,
            aiCellId,
            proposedOperations,
            fallbackExpressionContent,
          );
        const didRejectPlaygroundEdit = appliedOps.some(
          (op) => op.type === "rejected",
        );
        return {
          ...nb,
          cells,
          aiCells: {
            ...aiCells,
            [aiCellId]: {
              ...existing,
              status: "done",
              answer: didRejectPlaygroundEdit
                ? appendReadOnlyPlaygroundNote(result.naturalAnswer)
                : result.naturalAnswer,
              elapsedMs: Date.now() - now,
              trace: finalTrace,
              generatedCellIds,
              expressionOps: appliedOps,
              currentStage: undefined,
              currentDetail: undefined,
              clarificationRequest: result.clarificationRequest,
              solutionPlan: result.solutionPlan,
            },
          },
          updatedAt: Date.now(),
        };
      }),
    );
  } catch (error) {
    await progressWrite;
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again.";
    const errNbs = await Promise.resolve(store.get(asyncNotebooksAtom));
    await store.set(
      asyncNotebooksAtom,
      errNbs.map((nb) => {
        if (nb.id !== notebookId) return nb;
        const existing = nb.aiCells[aiCellId];
        if (!existing) return nb;
        return {
          ...nb,
          aiCells: {
            ...nb.aiCells,
            [aiCellId]: {
              ...existing,
              status: "error",
              errorMessage: message,
              elapsedMs: Date.now() - now,
              currentStage: undefined,
              currentDetail: undefined,
              trace: trace.map((s) => ({ ...s, state: "done" as const })),
            },
          },
        };
      }),
    );
  } finally {
    store.set(notebookProgressAtom, (prev) => {
      const next = { ...prev };
      delete next[aiCellId];
      return next;
    });
  }
}

/**
 * Generate a detailed step-by-step explanation for a completed AI turn, on
 * demand, from its stored solution plan and generated expressions — no
 * re-solve. Writes the result onto the AI cell's `explanation` field.
 */
export async function explainNotebookTurn(
  store: Store,
  notebookId: string,
  aiCellId: string,
): Promise<void> {
  const notebooks = await Promise.resolve(store.get(asyncNotebooksAtom));
  const notebook = notebooks.find((nb) => nb.id === notebookId);
  if (!notebook) return;
  const aiData = notebook.aiCells[aiCellId];
  if (!aiData || aiData.status !== "done") return;

  const client = await Promise.resolve(store.get(asyncLLMClientAtom));
  const model = modelIdForRequest(
    await Promise.resolve(store.get(asyncDefaultModelAtom)),
  );

  const generatedCells = notebook.cells.filter(
    (cell): cell is ExpressionsCell =>
      cell.kind === "expressions" && cell.aiCellId === aiCellId,
  );
  const summaries = await Promise.all(
    generatedCells.map((cell) => summarizeExpressionCell(cell)),
  );
  const expressions = summaries.flatMap((summary) => summary.results);

  const explanation = await explainSolution(
    client,
    model,
    aiData.prompt,
    aiData.solutionPlan,
    expressions,
  );

  const nbs = await Promise.resolve(store.get(asyncNotebooksAtom));
  await store.set(
    asyncNotebooksAtom,
    nbs.map((nb) => {
      if (nb.id !== notebookId) return nb;
      const existing = nb.aiCells[aiCellId];
      if (!existing) return nb;
      return {
        ...nb,
        aiCells: {
          ...nb.aiCells,
          [aiCellId]: { ...existing, explanation },
        },
        updatedAt: Date.now(),
      };
    }),
  );
}

const STAGE_LABELS: Record<string, string> = {
  planning: "Planning",
  thinking: "Thinking",
  fetching_docs: "Looking up docs",
  searching_web: "Searching web",
  calculating: "Calculating",
  calling_tool: "Calling tool",
  synthesizing: "Writing answer",
  done: "Done",
};

async function buildMCPTools(servers: MCPServer[]): Promise<{
  mcpTools: ChatCompletionTool[];
  mcpDispatch: Map<string, MCPToolDispatch>;
}> {
  const mcpTools: ChatCompletionTool[] = [];
  const mcpDispatch = new Map<string, MCPToolDispatch>();
  for (const server of servers) {
    const tools = await mcpManager.listTools(server).catch((e) => {
      console.warn(`MCP ${server.name} listTools failed:`, e);
      return [];
    });
    for (const tool of tools) {
      let name = `mcp_${slugifyName(server.name || server.id)}_${tool.name}`
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 64);
      if (mcpDispatch.has(name)) name = `${name.slice(0, 62)}_2`;
      const params = isJsonSchemaObject(tool.inputSchema)
        ? (tool.inputSchema as Record<string, unknown>)
        : { type: "object", properties: {} };
      mcpTools.push({
        type: "function",
        function: {
          name,
          description: tool.description ?? "",
          parameters: params,
        },
      });
      mcpDispatch.set(name, (args) =>
        mcpManager.callTool(server, tool.name, args),
      );
    }
  }
  return { mcpTools, mcpDispatch };
}

function slugifyName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isJsonSchemaObject(value: unknown): boolean {
  return (
    !!value &&
    typeof value === "object" &&
    (value as { type?: string }).type === "object"
  );
}

async function buildNotebookHistory(
  notebook: Notebook,
): Promise<AgentHistoryMessage[]> {
  const summaries = await Promise.all(
    notebook.cells
      .filter((cell): cell is ExpressionsCell => cell.kind === "expressions")
      .map(async (cell) => summarizeExpressionCell(cell)),
  );
  const byCellId = new Map(
    summaries.map((summary) => [summary.cell.id, summary]),
  );

  const snapshot = summaries
    .map((summary) => formatExpressionSummary(summary))
    .join("\n\n");
  const messages: AgentHistoryMessage[] = [
    {
      role: "system",
      content: `Notebook context is available below. The playground is user-owned and read-only for AI: use it as context, but never propose edits to any source=user expression cell. Prefer updating existing source=ai expression cells for follow-up refinements instead of creating duplicate calculations.\n\n${snapshot || "(no expressions yet)"}`,
    },
  ];

  for (const cell of notebook.cells) {
    if (cell.kind !== "ai") continue;
    const aiData = notebook.aiCells[cell.aiCellId];
    if (!aiData || aiData.status === "running") continue;
    const generated = notebook.cells
      .filter(
        (candidate): candidate is ExpressionsCell =>
          candidate.kind === "expressions" && candidate.aiCellId === aiData.id,
      )
      .map((candidate) => byCellId.get(candidate.id))
      .filter(Boolean) as ExpressionCellSummary[];

    messages.push({ role: "user", content: aiData.prompt });
    messages.push({
      role: "assistant",
      content: [
        aiData.answer ? `Answer: ${aiData.answer}` : "Answer: (none)",
        aiData.clarificationRequest
          ? `Clarification request:\n${JSON.stringify(aiData.clarificationRequest, null, 2)}`
          : null,
        generated.length > 0
          ? `Expression cells:\n${generated
              .map((summary) => formatExpressionSummary(summary))
              .join("\n\n")}`
          : "Expression cells: (none)",
      ]
        .filter(Boolean)
        .join("\n\n"),
    });
  }

  return messages;
}

async function summarizeExpressionCell(
  cell: ExpressionsCell,
): Promise<ExpressionCellSummary> {
  const expressions = splitExpressions(cell.content);
  const results =
    expressions.length > 0 ? await calculateExpressions(expressions) : [];
  return { cell, results };
}

function splitExpressions(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function formatExpressionSummary(summary: ExpressionCellSummary): string {
  const owner =
    summary.cell.source === "user"
      ? "PLAYGROUND / source=user / read-only for AI"
      : `AI-owned / source=ai / editable by AI / aiCellId=${summary.cell.aiCellId ?? "unknown"}`;
  const resultLines =
    summary.results.length > 0
      ? summary.results
          .map((item, index) => {
            const status = item.error ? "ERROR" : item.result;
            return `${index + 1}. ${item.expression} => ${status}`;
          })
          .join("\n")
      : "(no expressions)";
  return `Expression cell ${summary.cell.id} (${owner})\nContent:\n${summary.cell.content || "(empty)"}\nResults:\n${resultLines}`;
}

async function proposeExpressionOperations(
  client: LLMClient,
  model: string,
  userPrompt: string,
  naturalAnswer: string,
  generatedExpressions: ExpWithResult[],
  notebook: Notebook,
  history: AgentHistoryMessage[],
): Promise<ProposedExpressionOperation[]> {
  const aiCells = notebook.cells.filter(
    (cell): cell is ExpressionsCell =>
      cell.kind === "expressions" && cell.source === "ai",
  );
  const playgroundCells = notebook.cells.filter(
    (cell): cell is ExpressionsCell =>
      cell.kind === "expressions" && cell.source === "user",
  );

  const response = await client.chat.completions.create({
    model,
    stream: false,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You decide how to apply expression changes to a Hissab notebook after an assistant response.
Return JSON only in this exact shape: {"operations":[...]}.
Allowed operations:
- {"type":"create","content":"full Hissab expression cell content","title":"short descriptive title"}
- {"type":"update","cellId":"existing source=ai expression cell id","content":"full replacement content","title":"short descriptive title"}
- {"type":"delete","cellId":"existing source=ai expression cell id"}

Rules:
- Never create operations targeting source=user cells. Those are playground cells and are read-only for AI.
- Prefer "update" for follow-up refinements to an existing AI-owned calculation.
- Use "create" only for a clearly new calculation.
- Use "delete" only when the user explicitly asks to remove an AI-owned calculation.
- For create/update, content must be the complete final expression cell content, not a patch.
- For create/update, title must be 2-6 words, specific to the topic and calculations, and should not include punctuation.
- If no expression change is needed, return {"operations":[]}.`,
      },
      ...history,
      {
        role: "user",
        content: JSON.stringify(
          {
            userPrompt,
            naturalAnswer,
            generatedExpressions,
            editableAiExpressionCells: aiCells.map((cell) => ({
              cellId: cell.id,
              aiCellId: cell.aiCellId,
              title: cell.title ?? "",
              content: cell.content,
            })),
            readOnlyPlaygroundCells: playgroundCells.map((cell) => ({
              cellId: cell.id,
              content: cell.content,
            })),
          },
          null,
          2,
        ),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = parseJsonObject(raw) as {
    operations?: ProposedExpressionOperation[];
  };
  return Array.isArray(parsed.operations) ? parsed.operations : [];
}

function applyExpressionOperations(
  cells: Cell[],
  aiCells: Record<string, AICellData>,
  aiCellId: string,
  proposedOperations: ProposedExpressionOperation[],
  fallbackContent: string,
): {
  cells: Cell[];
  aiCells: Record<string, AICellData>;
  appliedOps: AppliedExpressionOperation[];
  generatedCellIds: string[];
} {
  const operations =
    proposedOperations.length > 0
      ? proposedOperations
      : fallbackContent.trim()
        ? [{ type: "create" as const, content: fallbackContent }]
        : [];
  const nextCells = [...cells];
  const appliedOps: AppliedExpressionOperation[] = [];
  const generatedCellIds: string[] = [];
  const deletedCellIds = new Set<string>();
  const aiBlockIndex = nextCells.findIndex(
    (cell) => cell.kind === "ai" && cell.aiCellId === aiCellId,
  );
  let insertAt = aiBlockIndex >= 0 ? aiBlockIndex + 1 : nextCells.length;

  for (const operation of operations) {
    if (operation.type === "create") {
      const content = operationContent(operation, fallbackContent);
      if (!content.trim()) continue;
      const cellId = crypto.randomUUID();
      nextCells.splice(insertAt, 0, {
        id: cellId,
        kind: "expressions",
        content,
        source: "ai",
        title: operationTitle(operation, content),
        aiCellId,
      });
      insertAt++;
      generatedCellIds.push(cellId);
      appliedOps.push({ type: "create", cellId, content });
      continue;
    }

    const targetCellId = operation.cellId;
    const targetIndex = nextCells.findIndex((cell) => cell.id === targetCellId);
    const target = targetIndex >= 0 ? nextCells[targetIndex] : null;
    if (!target || target.kind !== "expressions") {
      appliedOps.push({
        type: "rejected",
        targetCellId,
        reason: "Target expression cell was not found.",
      });
      continue;
    }
    if (target.source !== "ai") {
      appliedOps.push({
        type: "rejected",
        targetCellId: target.id,
        reason: "AI cannot modify the user-owned playground.",
      });
      continue;
    }

    if (operation.type === "update") {
      const content = operationContent(operation, fallbackContent);
      if (!content.trim()) continue;
      nextCells[targetIndex] = {
        ...target,
        content,
        title: operationTitle(operation, content, target.title),
      };
      appliedOps.push({
        type: "update",
        cellId: target.id,
        previousContent: target.content,
        content,
      });
      continue;
    }

    nextCells.splice(targetIndex, 1);
    deletedCellIds.add(target.id);
    appliedOps.push({
      type: "delete",
      cellId: target.id,
      previousContent: target.content,
    });
    if (targetIndex < insertAt) insertAt--;
  }

  const nextAiCells: Record<string, AICellData> = Object.fromEntries(
    Object.entries(aiCells).map(([id, data]) => [
      id,
      {
        ...data,
        generatedCellIds: data.generatedCellIds.filter(
          (cellId) => !deletedCellIds.has(cellId),
        ),
      },
    ]),
  );

  return {
    cells: nextCells,
    aiCells: nextAiCells,
    appliedOps,
    generatedCellIds,
  };
}

function operationContent(
  operation: Extract<
    ProposedExpressionOperation,
    { type: "create" | "update" }
  >,
  fallbackContent: string,
): string {
  if (typeof operation.content === "string") return operation.content.trim();
  if (Array.isArray(operation.expressions)) {
    return operation.expressions
      .map((expression) => String(expression).trim())
      .filter(Boolean)
      .join("\n");
  }
  return fallbackContent.trim();
}

function operationTitle(
  operation: Extract<
    ProposedExpressionOperation,
    { type: "create" | "update" }
  >,
  content: string,
  existingTitle?: string,
): string {
  if (typeof operation.title === "string") {
    const title = sanitizeExpressionTitle(operation.title);
    if (title) return title;
  }
  if (existingTitle) return existingTitle;
  return deriveExpressionTitle(content);
}

function sanitizeExpressionTitle(title: string): string {
  return title
    .replace(/[^\p{L}\p{N}\s/%$.-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 64);
}

function deriveExpressionTitle(content: string): string {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) return "AI Calculation";
  const label = firstLine.match(/^([a-zA-Z][\w]*)\s*=/)?.[1];
  if (label) {
    const words = label
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .trim();
    if (words) return sanitizeExpressionTitle(words);
  }
  return "AI Calculation";
}

function appendReadOnlyPlaygroundNote(answer: string): string {
  const note = "I can read the playground, but I did not modify it.";
  return answer.trim() ? `${answer}\n\n${note}` : note;
}
