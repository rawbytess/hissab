import { atom } from "jotai";
import { loadable } from "jotai/utils";
import type {
  AgentProgressStage,
  ClarificationRequest,
  SolutionPlan,
} from "@/lib/agentic/types.ts";
import {
  type FileType,
  saveLegacyFileToIDB,
} from "@/lib/idb-stores/file-store.ts";
import {
  deleteNoteFromIDB,
  getAllNotesFromIDB,
  getNoteFromIDB,
  saveNoteToIDB,
} from "@/lib/idb-stores/notes-store.ts";

export type { FileType } from "@/lib/idb-stores/file-store.ts";

export type TraceStep = {
  stage: AgentProgressStage;
  label: string;
  detail?: string;
  t: string;
  state?: "done" | "active";
};

export type AICellData = {
  id: string;
  prompt: string;
  askedAt: number;
  status: "running" | "done" | "error";
  answer?: string;
  errorMessage?: string;
  trace?: TraceStep[];
  generatedCellIds: string[];
  expressionOps?: AppliedExpressionOperation[];
  currentStage?: AgentProgressStage;
  currentDetail?: string;
  elapsedMs?: number;
  /** Required user inputs that must be supplied before solving. */
  clarificationRequest?: ClarificationRequest;
  /** Structured breakdown of how the problem was solved (complex path only). */
  solutionPlan?: SolutionPlan;
  /** On-demand step-by-step explanation, generated when the user asks. */
  explanation?: string;
};

export type AppliedExpressionOperation =
  | {
      type: "create";
      cellId: string;
      content: string;
    }
  | {
      type: "update";
      cellId: string;
      previousContent: string;
      content: string;
    }
  | {
      type: "delete";
      cellId: string;
      previousContent: string;
    }
  | {
      type: "rejected";
      reason: string;
      targetCellId?: string;
    };

export type ExpressionsCell = {
  id: string;
  kind: "expressions";
  content: string;
  source: "user" | "ai";
  title?: string;
  aiCellId?: string;
};

export type AICellBlock = {
  id: string;
  kind: "ai";
  aiCellId: string;
};

export type Cell = ExpressionsCell | AICellBlock;

export type Notebook = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  fileIds: string[];
  /** @deprecated legacy single attachment field, migrated into fileIds. */
  file?: FileType | null;
  cells: Cell[];
  aiCells: Record<string, AICellData>;
};

export function createNotebook(title: string): Notebook {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    fileIds: [],
    cells: [
      {
        id: crypto.randomUUID(),
        kind: "expressions",
        content: "",
        source: "user",
      },
    ],
    aiCells: {},
  };
}

/**
 * Case-insensitive substring match across a notebook's title and all of its
 * text content: expression-cell text (user + AI-generated) and AI cell
 * prompts/answers/explanations. Used by the sidebar search.
 */
export function notebookMatchesQuery(nb: Notebook, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  if (nb.title.toLowerCase().includes(q)) return true;
  for (const cell of nb.cells) {
    if (cell.kind === "expressions" && cell.content.toLowerCase().includes(q)) {
      return true;
    }
  }
  for (const ai of Object.values(nb.aiCells)) {
    if (
      ai.prompt.toLowerCase().includes(q) ||
      ai.answer?.toLowerCase().includes(q) ||
      ai.explanation?.toLowerCase().includes(q)
    ) {
      return true;
    }
  }
  return false;
}

/* ------- Legacy migration ------- */
type LegacyPage = {
  id: string;
  title: string;
  type?: "page" | "chat";
  content?: string;
  file?: FileType | null;
  messages?: unknown[];
};

function migrateToNotebook(legacy: LegacyPage): Notebook | null {
  if (legacy.type === "chat") return null;
  const now = Date.now();
  return {
    id: legacy.id,
    title: legacy.title,
    createdAt: now,
    updatedAt: now,
    fileIds: [],
    file: legacy.file ?? null,
    cells: [
      {
        id: crypto.randomUUID(),
        kind: "expressions",
        content: legacy.content ?? "",
        source: "user",
      },
    ],
    aiCells: {},
  };
}

async function normalizeNotebookFiles(notebook: Notebook): Promise<Notebook> {
  const legacyFile = notebook.file ?? null;
  const fileIds = Array.isArray(notebook.fileIds) ? [...notebook.fileIds] : [];
  if (legacyFile?.id && !fileIds.includes(legacyFile.id)) {
    const migrated = await saveLegacyFileToIDB(legacyFile);
    if (migrated) fileIds.push(migrated.id);
  }
  if (legacyFile || notebook.fileIds !== fileIds) {
    const normalized = {
      ...notebook,
      fileIds,
      file: null,
    };
    await saveNoteToIDB(normalized.id, normalized);
    return normalized;
  }
  return { ...notebook, fileIds };
}

/* ------- Atom ------- */

const notebooksDataAtom = atom<Notebook[] | null>(null);

let initialLoadPromise: Promise<Notebook[]> | null = null;

const loadNotebooksFromStorage = async (): Promise<Notebook[]> => {
  const legacyNotesJSON = localStorage.getItem("hissab-pages");
  if (legacyNotesJSON) {
    try {
      const legacyNotes: LegacyPage[] = JSON.parse(legacyNotesJSON);
      if (Array.isArray(legacyNotes) && legacyNotes.length > 0) {
        const notebooks: Notebook[] = legacyNotes
          .map(migrateToNotebook)
          .filter(Boolean) as Notebook[];
        const normalized = await Promise.all(
          notebooks.map((nb) => normalizeNotebookFiles(nb)),
        );
        await Promise.all(normalized.map((nb) => saveNoteToIDB(nb.id, nb)));
        localStorage.removeItem("hissab-pages");
        return normalized;
      }
    } catch {
      localStorage.removeItem("hissab-pages");
    }
  }

  const noteIds = await getAllNotesFromIDB();
  const all: Notebook[] = [];
  for (const id of noteIds) {
    const stored = await getNoteFromIDB(id);
    if (stored) {
      const storedLegacy = stored as unknown as LegacyPage;
      if (storedLegacy.type === "chat") {
        await deleteNoteFromIDB(id);
        continue;
      }
      if (storedLegacy.type === "page" || storedLegacy.type === undefined) {
        if (!(stored as Notebook).cells) {
          const migrated = migrateToNotebook(storedLegacy);
          if (migrated) {
            const normalized = await normalizeNotebookFiles(migrated);
            await saveNoteToIDB(normalized.id, normalized);
            all.push(normalized);
          }
          continue;
        }
      }
      all.push(await normalizeNotebookFiles(stored));
    }
  }
  return all;
};

export const asyncNotebooksAtom = atom<
  Notebook[] | Promise<Notebook[]>,
  [Notebook[]],
  void
>(
  (get) => {
    const cached = get(notebooksDataAtom);
    if (cached !== null) return cached;
    if (!initialLoadPromise) {
      initialLoadPromise = loadNotebooksFromStorage();
    }
    return initialLoadPromise;
  },
  async (get, set, update: Notebook[]) => {
    const current = await get(asyncNotebooksAtom);
    set(notebooksDataAtom, update);
    await Promise.all(update.map((nb) => saveNoteToIDB(nb.id, nb)));
    await Promise.all(
      current.map(async (nb) => {
        if (!update.find((n) => n.id === nb.id)) {
          await deleteNoteFromIDB(nb.id);
        }
      }),
    );
  },
);

export const notebooksAtom = loadable(asyncNotebooksAtom);

/* ------- Chat progress (keyed by aiCellId) ------- */
export type NotebookProgressEntry = {
  notebookId: string;
  aiCellId: string;
  stage: AgentProgressStage;
  detail?: string;
  startedAt: number;
};

export const notebookProgressAtom = atom<Record<string, NotebookProgressEntry>>(
  {},
);
