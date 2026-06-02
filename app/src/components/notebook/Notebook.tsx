import { useAtom } from "jotai";
import { useRef } from "react";
import type {
  AICellBlock,
  ExpressionsCell as ExpressionsCellType,
  Notebook as NotebookType,
} from "@/lib/atoms/notebooks.ts";
import { notebookProgressAtom, notebooksAtom } from "@/lib/atoms/notebooks.ts";
import { Composer, type ComposerHandle } from "./Composer.tsx";
import { ExpressionsCell } from "./ExpressionsCell.tsx";
import { FloatingToast } from "./FloatingToast.tsx";
import { NotebookStarter } from "./NotebookStarter.tsx";
import { TurnBlock } from "./TurnBlock.tsx";

interface NotebookProps {
  notebookId: string;
  onAskAI: (notebookId: string, prompt: string) => void;
}

type RenderItem =
  | { kind: "user-cell"; cell: ExpressionsCellType }
  | {
      kind: "turn";
      block: AICellBlock;
      generatedCells: ExpressionsCellType[];
    };

export function Notebook({ notebookId, onAskAI }: NotebookProps) {
  const [notebooksValue] = useAtom(notebooksAtom);
  const [progress] = useAtom(notebookProgressAtom);
  const canvasRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ComposerHandle>(null);

  if (notebooksValue.state === "loading") return null;
  if (notebooksValue.state === "hasError") return null;

  const notebook: NotebookType | undefined = notebooksValue.data.find(
    (nb) => nb.id === notebookId,
  );
  if (!notebook) return null;

  const runningProgressEntry = Object.values(progress).find(
    (p) => p.notebookId === notebookId,
  );
  const runningProgress = runningProgressEntry
    ? progress[runningProgressEntry.aiCellId]
    : undefined;

  const handleJumpToAi = (aiCellId: string) => {
    const el = document.getElementById(`aic-${aiCellId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.animate(
        [
          { boxShadow: "0 0 0 6px rgba(160, 107, 255, 0.25)" },
          { boxShadow: "0 0 0 0 rgba(160, 107, 255, 0)" },
        ],
        { duration: 1200, easing: "ease-out" },
      );
    }
  };

  // Group cells into a render plan: standalone user cells stay outside; each
  // AICellBlock collapses with the consecutive ExpressionsCells that point at
  // it via aiCellId.
  const items: RenderItem[] = [];
  for (let i = 0; i < notebook.cells.length; i++) {
    const cell = notebook.cells[i];
    if (cell.kind === "ai") {
      const generated: ExpressionsCellType[] = [];
      let j = i + 1;
      while (j < notebook.cells.length) {
        const next = notebook.cells[j];
        if (next.kind === "expressions" && next.aiCellId === cell.aiCellId) {
          generated.push(next);
          j++;
        } else {
          break;
        }
      }
      items.push({ kind: "turn", block: cell, generatedCells: generated });
      i = j - 1;
    } else {
      items.push({ kind: "user-cell", cell });
    }
  }

  const playgroundCell = notebook.cells.find(
    (cell): cell is ExpressionsCellType =>
      cell.kind === "expressions" && cell.source === "user",
  );
  const playgroundCellId = playgroundCell?.id;

  // The getting-started starter shows only on a fresh notebook: no AI turn yet
  // (a turn appends an `ai` cell the instant the chat starts) and an empty
  // playground. Either action makes it disappear.
  const showStarter =
    !notebook.cells.some((cell) => cell.kind === "ai") &&
    !playgroundCell?.content.trim();

  return (
    <div className="wb-canvas scroll" ref={canvasRef} id="wb-canvas">
      <div className="notebook2">
        <div className="nb2-editor">
          {(() => {
            let turnIndex = 0;
            return items.map((item) => {
              if (item.kind === "user-cell") {
                return (
                  <ExpressionsCell
                    key={item.cell.id}
                    cell={item.cell}
                    notebookId={notebookId}
                    variant={
                      item.cell.id === playgroundCellId
                        ? "playground"
                        : "default"
                    }
                  />
                );
              }
              const aiData = notebook.aiCells[item.block.aiCellId];
              if (!aiData) return null;
              const currentIndex = turnIndex++;
              return (
                <TurnBlock
                  key={item.block.id}
                  data={aiData}
                  generatedCells={item.generatedCells}
                  notebookId={notebookId}
                  index={currentIndex}
                  allNotebooks={notebooksValue.data}
                  onRerun={(prompt) => onAskAI(notebookId, prompt)}
                />
              );
            });
          })()}
        </div>

        {showStarter && (
          <NotebookStarter
            onPickExample={(prompt) => composerRef.current?.setValue(prompt)}
          />
        )}
      </div>

      <div className="wb-composer-inline">
        <div className="inner">
          {runningProgress && (
            <FloatingToast
              stage={runningProgress.stage}
              detail={runningProgress.detail}
              startedAt={runningProgress.startedAt}
              onJumpToCell={
                runningProgressEntry
                  ? () => handleJumpToAi(runningProgressEntry.aiCellId)
                  : undefined
              }
            />
          )}
          <Composer
            ref={composerRef}
            notebookId={notebookId}
            fileIds={notebook.fileIds ?? []}
            onSubmit={(prompt) => onAskAI(notebookId, prompt)}
            disabled={!!runningProgress}
          />
        </div>
      </div>
    </div>
  );
}
