import { useAtom, useSetAtom } from "jotai";
import { Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TokenInteractionPopover } from "@/components/editor/TokenPopovers.tsx";
import type {
  ExpressionsCell as ExpressionsCellType,
  Notebook,
} from "@/lib/atoms/notebooks.ts";
import { asyncNotebooksAtom, notebooksAtom } from "@/lib/atoms/notebooks.ts";
import HissabEditor, { type HissabEditorType } from "@/lib/editor/editor.ts";
import {
  TOKEN_INTERACT_EVENT,
  type TokenInteractionDetail,
} from "@/lib/editor/tokenDecorations.ts";

interface ExpressionsCellProps {
  cell: ExpressionsCellType;
  notebookId: string;
  variant?: "default" | "playground";
}

export function ExpressionsCell({
  cell,
  notebookId,
  variant = "default",
}: ExpressionsCellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HissabEditorType | null>(null);
  const [notebooksValue] = useAtom(notebooksAtom);
  const setNotebooks = useSetAtom(asyncNotebooksAtom);
  // Active colour/date popover, opened from a clickable editor widget.
  const [interaction, setInteraction] = useState<TokenInteractionDetail | null>(
    null,
  );

  const notebooksRef = useRef<Notebook[]>([]);
  useEffect(() => {
    if (notebooksValue.state === "hasData")
      notebooksRef.current = notebooksValue.data;
  }, [notebooksValue]);

  const cellRef = useRef(cell);
  cellRef.current = cell;

  useEffect(() => {
    if (!containerRef.current) return;

    const he: HissabEditorType = new HissabEditor(containerRef.current, {
      currentPage: `${notebookId}:${cell.id}`,
      storePage: (content: string) => {
        const notebooks = notebooksRef.current;
        setNotebooks(
          notebooks.map((nb) =>
            nb.id === notebookId
              ? {
                  ...nb,
                  cells: nb.cells.map((c) =>
                    c.id === cellRef.current.id && c.kind === "expressions"
                      ? { ...c, content }
                      : c,
                  ),
                  updatedAt: Date.now(),
                }
              : nb,
          ),
        );
      },
      isWritable: true,
      isDark: true,
    });

    he.init().then(() => {
      he.replaceDocument(cellRef.current.content ?? "", { focus: false });
    });
    editorRef.current = he;

    return () => {
      editorRef.current = null;
      he.destroy();
    };
    // Re-create editor when notebook/cell id changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notebookId, cell.id, setNotebooks]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const nextContent = cell.content ?? "";
    if (editor.getText() !== nextContent) {
      editor.replaceDocument(nextContent, { focus: false });
    }
  }, [cell.content]);

  // The editor's clickable token widgets (colour swatch, date glyph) bubble a
  // CustomEvent up to this container; open the matching picker popover.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      setInteraction((e as CustomEvent<TokenInteractionDetail>).detail);
    };
    el.addEventListener(TOKEN_INTERACT_EVENT, handler as EventListener);
    return () =>
      el.removeEventListener(TOKEN_INTERACT_EVENT, handler as EventListener);
  }, []);

  const headerTitle =
    variant === "playground"
      ? "Playground"
      : cell.source === "ai"
        ? (cell.title ?? deriveExpressionTitle(cell.content))
        : null;

  const handleCopy = () => {
    void navigator.clipboard?.writeText(cell.content ?? "");
  };

  return (
    <div
      className={`nb2-expressions-cell ${variant}${cell.source === "ai" ? " ai-sourced" : ""}`}
    >
      {headerTitle && (
        <div className="nb2-editor-header">
          <span className="lang">CALC</span>
          <span className="title">{headerTitle}</span>
          <span className="meta">
            <button
              type="button"
              className="head-btn"
              title="Copy"
              onClick={handleCopy}
            >
              <Copy size={11} />
            </button>
          </span>
        </div>
      )}
      <div ref={containerRef} className="nb2-editor-mount" />
      <TokenInteractionPopover
        interaction={interaction}
        onClose={() => setInteraction(null)}
        onCommit={(from, to, text) =>
          editorRef.current?.replaceRange(from, to, text)
        }
      />
    </div>
  );
}

function deriveExpressionTitle(content: string): string {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (!firstLine) return "AI Calculation";
  const label = firstLine.match(/^([a-zA-Z][\w]*)\s*=/)?.[1];
  if (!label) return "AI Calculation";
  return (
    label
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 64) || "AI Calculation"
  );
}
