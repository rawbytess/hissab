import { useSetAtom, useStore } from "jotai";
import {
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  Circle,
  Copy,
  Edit3,
  Layers,
  ListOrdered,
  Redo2,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AgentProgressStage } from "@/lib/agentic/types.ts";
import {
  type AICellData,
  asyncNotebooksAtom,
  type ExpressionsCell as ExpressionsCellType,
  type Notebook,
  type TraceStep,
} from "@/lib/atoms/notebooks.ts";
import { ExpressionsCell } from "./ExpressionsCell.tsx";

// Lazy-loaded: pulls in react-markdown + remark/rehype + KaTeX (JS + CSS),
// only needed once an AI answer actually renders.
const AnswerMarkdown = lazy(() =>
  import("./AnswerMarkdown.tsx").then((m) => ({ default: m.AnswerMarkdown })),
);

interface TurnBlockProps {
  data: AICellData;
  generatedCells: ExpressionsCellType[];
  notebookId: string;
  index: number;
  allNotebooks: Notebook[];
  onRerun: (prompt: string) => void;
}

const STAGE_LABELS: Record<string, string> = {
  planning: "Planning",
  thinking: "Thinking",
  fetching_docs: "Looking up docs",
  searching_web: "Searching web",
  calculating: "Calculating",
  synthesizing: "Writing answer",
  done: "Done",
};

function StageIcon({ stage }: { stage: AgentProgressStage | undefined }) {
  if (stage === "planning" || stage === "thinking") return <Layers size={11} />;
  if (stage === "fetching_docs") return <BookOpen size={11} />;
  if (stage === "searching_web") return <Search size={11} />;
  if (stage === "calculating") return <Calculator size={11} />;
  if (stage === "synthesizing") return <Edit3 size={11} />;
  return <Sparkles size={11} />;
}

function LiveTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(Date.now() - startedAt);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(id);
  }, [startedAt]);
  return <span>{(elapsed / 1000).toFixed(1)}s</span>;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatElapsed(ms: number | undefined, startedAt: number) {
  const v = ms ?? Date.now() - startedAt;
  return `${(v / 1000).toFixed(1)}s`;
}

/* =========================================================
   Inline agentic trace
   ========================================================= */
function traceRowStatus(
  step: TraceStep,
): "done" | "active" | "pending" | "error" {
  if (step.state === "active") return "active";
  if (step.state === "done") return "done";
  return "pending";
}

function TraceRowIcon({
  status,
}: {
  status: ReturnType<typeof traceRowStatus>;
}) {
  if (status === "done") return <Check size={10} />;
  if (status === "active") return <Circle size={6} fill="currentColor" />;
  return <Circle size={7} />;
}

function TraceInline({
  trace,
  elapsedMs,
  startedAt,
  onClose,
  running,
}: {
  trace: TraceStep[];
  elapsedMs: number | undefined;
  startedAt: number;
  onClose: () => void;
  running: boolean;
}) {
  const doneCount = trace.filter((s) => s.state === "done").length;
  return (
    <div className="trace-inline">
      <div className="trace-inline-head">
        <span className="ttl">Agentic trace</span>
        <span className="grow" />
        <span className="stat">
          <strong>
            {doneCount}/{trace.length}
          </strong>{" "}
          steps
        </span>
        <span className="stat" style={{ marginLeft: 10 }}>
          ·{" "}
          <strong>
            {running ? (
              <LiveTimer startedAt={startedAt} />
            ) : (
              formatElapsed(elapsedMs, startedAt)
            )}
          </strong>
        </span>
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          title="Hide trace"
        >
          <X size={13} />
        </button>
      </div>
      <div className="trace-list">
        {trace.length === 0 && (
          <div className="trace-row pending" style={{ color: "var(--text-3)" }}>
            <div className="icon pending">
              <Circle size={7} />
            </div>
            <div className="body">
              <div className="lbl">No trace recorded for this turn.</div>
            </div>
            <div className="dur" />
          </div>
        )}
        {trace.map((step, i) => {
          const status = traceRowStatus(step);
          return (
            <div className={`trace-row ${status}`} key={`${step.stage}-${i}`}>
              <div className={`icon ${status}`}>
                <TraceRowIcon status={status} />
              </div>
              <div className="body">
                <div className="lbl">
                  <span>{step.label}</span>
                  {step.detail && <span className="arg">{step.detail}</span>}
                </div>
              </div>
              <div className={`dur ${status === "active" ? "active" : ""}`}>
                {status === "active" ? (
                  <LiveTimer startedAt={startedAt} />
                ) : (
                  step.t || ""
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Turn block — threaded layout
   ========================================================= */
export function TurnBlock({
  data,
  generatedCells,
  notebookId,
  index,
  allNotebooks,
  onRerun,
}: TurnBlockProps) {
  const setNotebooks = useSetAtom(asyncNotebooksAtom);
  const store = useStore();
  const running = data.status === "running";
  const errored = data.status === "error";
  const trace = data.trace ?? [];
  const [traceOpen, setTraceOpen] = useState(running);
  const [explaining, setExplaining] = useState(false);

  const handleExplain = async () => {
    if (explaining) return;
    setExplaining(true);
    try {
      const { explainNotebookTurn } = await import(
        "@/lib/agentic/notebookRunner.ts"
      );
      await explainNotebookTurn(store, notebookId, data.id);
    } catch {
      toast.error("Couldn't generate the explanation.");
    } finally {
      setExplaining(false);
    }
  };

  useEffect(() => {
    setTraceOpen(running);
  }, [running]);

  const activeLabel =
    trace.find((s) => s.state === "active")?.label ??
    (data.currentStage
      ? (STAGE_LABELS[data.currentStage] ?? data.currentStage)
      : "Working");
  const activeDetail =
    trace.find((s) => s.state === "active")?.detail ?? data.currentDetail;

  const removeTurnFromState = () => {
    const notebook = allNotebooks.find((n) => n.id === notebookId);
    if (!notebook) return;
    const generatedIds = new Set(generatedCells.map((c) => c.id));
    const nextCells = notebook.cells.filter((c) => {
      if (c.kind === "ai" && c.aiCellId === data.id) return false;
      if (c.kind === "expressions" && generatedIds.has(c.id)) return false;
      return true;
    });
    const nextAiCells = { ...notebook.aiCells };
    delete nextAiCells[data.id];
    setNotebooks(
      allNotebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              cells: nextCells,
              aiCells: nextAiCells,
              updatedAt: Date.now(),
            }
          : nb,
      ),
    );
  };

  const handleDeleteTurn = () => {
    removeTurnFromState();
    toast.success("Turn deleted");
  };

  const handleCopy = (text: string) => {
    void navigator.clipboard?.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleRerun = () => {
    const prompt = data.prompt;
    removeTurnFromState();
    onRerun(prompt);
  };

  const traceSummary = (
    <>
      <span className="lbl">Working</span>
      <span>·</span>
      <span className="num">
        step {Math.max(trace.findIndex((r) => r.state === "active") + 1, 1)}/
        {Math.max(trace.length, 1)}
      </span>
      <span>·</span>
      <LiveTimer startedAt={data.askedAt} />
    </>
  );

  return (
    <div className="turn" id={`aic-${data.id}`} data-turn-index={index}>
      {/* ----- Prompt (right-aligned bubble) ----- */}
      <div className="t-prompt">
        <div className="t-prompt-wrap">
          <div className="t-prompt-row">
            <div className="t-prompt-bubble">
              <span className="t-prompt-tools">
                <button
                  type="button"
                  className="tool"
                  title="Copy"
                  onClick={() => handleCopy(data.prompt)}
                >
                  <Copy size={13} />
                </button>
                <button
                  type="button"
                  className="tool"
                  title="Rerun"
                  onClick={handleRerun}
                  disabled={running}
                >
                  <Redo2 size={13} />
                </button>
                <button
                  type="button"
                  className="tool danger"
                  title="Delete"
                  onClick={handleDeleteTurn}
                >
                  <Trash2 size={13} />
                </button>
              </span>
              {data.prompt}
            </div>
            <div className="t-prompt-time">{formatTime(data.askedAt)}</div>
          </div>
        </div>
      </div>

      {/* ----- Answer block (Hissab avatar on left) ----- */}
      <div className="row">
        <div className="row-avatar">
          <span className="avatar ai">
            <img src="/icons/64.png" alt="Hissab" />
          </span>
        </div>
        <div className="row-body">
          {running && (
            <button
              type="button"
              className={`trace-toggle${traceOpen ? " open" : ""}${
                running ? " running" : ""
              }`}
              onClick={() => setTraceOpen((v) => !v)}
            >
              <span className="summary">{traceSummary}</span>
              <ChevronDown size={12} className="chev" />
            </button>
          )}

          {running && traceOpen && (
            <TraceInline
              trace={trace}
              elapsedMs={data.elapsedMs}
              startedAt={data.askedAt}
              running={running}
              onClose={() => setTraceOpen(false)}
            />
          )}

          {running && (
            <div className="running-strip">
              <span className="pulse" />
              <span className="stage">{activeLabel}</span>
              {activeDetail && <span className="detail">{activeDetail}</span>}
              <span className="timer">
                <LiveTimer startedAt={data.askedAt} />
              </span>
              <StageIcon stage={data.currentStage} />
            </div>
          )}

          {!running && data.answer && (
            <div className={`t-answer-block${running ? " running" : ""}`}>
              <Suspense
                fallback={<div className="t-answer-text">{data.answer}</div>}
              >
                <AnswerMarkdown>{data.answer}</AnswerMarkdown>
              </Suspense>
            </div>
          )}

          {!running && data.solutionPlan && !data.explanation && (
            <button
              type="button"
              className="trace-toggle"
              onClick={handleExplain}
              disabled={explaining}
            >
              <span className="summary">
                <ListOrdered size={12} />
                <span className="lbl">
                  {explaining ? "Writing explanation…" : "Show steps"}
                </span>
              </span>
            </button>
          )}

          {!running && data.explanation && (
            <div className="t-answer-block">
              <Suspense
                fallback={
                  <div className="t-answer-text">{data.explanation}</div>
                }
              >
                <AnswerMarkdown>{data.explanation}</AnswerMarkdown>
              </Suspense>
            </div>
          )}

          {errored && (
            <div className="t-answer-error">
              {data.errorMessage ?? "Something went wrong. Please try again."}
            </div>
          )}

          {generatedCells.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {generatedCells.map((cell) => (
                <div className="t-cell" key={cell.id}>
                  <ExpressionsCell cell={cell} notebookId={notebookId} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
