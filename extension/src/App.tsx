import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  type ArtifactsDetail,
  appendDrawArg,
  CELL_ARTIFACTS_EVENT,
  type CellArtifact,
  overlayCandidatesFor,
} from "@/lib/editor/cellArtifacts.ts";
import HissabEditor, { type HissabEditorType } from "@/lib/editor/editor.ts";
import {
  TOKEN_INTERACT_EVENT,
  type TokenInteractionDetail,
} from "@/lib/editor/tokenDecorations.ts";
import {
  loadFirstRunContent,
  readSavedContent,
  saveContent,
} from "./storage.ts";

const HOME_URL = "https://hissab.io";
const DOCS_URL = "https://hissab.io/docs";
const GITHUB_URL = "https://github.com/rawbytess/hissab";

// Everything below is kept out of the startup bundle, which is parsed on every
// popup open. Graphs pull in function-plot + d3 and only load once the
// document draws one; the colour/date pickers pull in Base UI + Floating UI and
// only load once a swatch or date glyph is clicked.
const GraphArtifact = lazy(
  () => import("@/components/notebook/GraphArtifact.tsx"),
);
const TokenInteractionPopover = lazy(() =>
  import("@/components/editor/TokenPopovers.tsx").then((m) => ({
    default: m.TokenInteractionPopover,
  })),
);

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HissabEditorType | null>(null);
  // Active colour/date popover, opened from a clickable editor widget.
  const [interaction, setInteraction] = useState<TokenInteractionDetail | null>(
    null,
  );
  // Graphs extracted from the document, rendered below the editor.
  const [artifacts, setArtifacts] = useState<CellArtifact[]>([]);

  // A layout effect, so on the usual path — a saved document, read
  // synchronously — the editor is built, filled, focused and has its results
  // before the popup paints its first frame.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let disposed = false;
    // The result pass calls storePage on every change and cursor move; ignore
    // anything before the document has been loaded into the editor.
    let ready = false;
    let editor: HissabEditorType | null = null;

    // The content is always resolved before the editor exists, so nothing can
    // be typed (and saved) over it while it is being read.
    const mount = async (initial: string) => {
      const he: HissabEditorType = new HissabEditor(el, {
        currentPage: "extension",
        storePage: (content: string) => {
          if (ready) saveContent(content);
        },
        isWritable: true,
        isDark: true,
        editorBackground: "transparent",
      });
      await he.init();
      if (disposed) {
        he.destroy();
        return;
      }
      editor = he;
      editorRef.current = he;
      ready = true;
      he.replaceDocument(initial, {
        focus: true,
        addToHistory: false,
        cursorAtEnd: true,
      });
    };

    const saved = readSavedContent();
    if (saved !== null) {
      void mount(saved);
    } else {
      // First run: import from the 3.x extension (async IndexedDB) or sample.
      void loadFirstRunContent().then((content) => {
        if (!disposed) return mount(content);
      });
    }

    return () => {
      disposed = true;
      editorRef.current = null;
      editor?.destroy();
    };
  }, []);

  // The editor's clickable token widgets (colour swatch, date glyph) bubble a
  // CustomEvent up to the mount; open the matching picker popover.
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

  // The editor recomputes its graphs on each change and bubbles them here.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      setArtifacts((e as CustomEvent<ArtifactsDetail>).detail.artifacts);
    };
    el.addEventListener(CELL_ARTIFACTS_EVENT, handler as EventListener);
    return () =>
      el.removeEventListener(CELL_ARTIFACTS_EVENT, handler as EventListener);
  }, []);

  // Overlay `exprText` onto the draw()/plot() call on line `lineNumber`
  // (0-indexed). The edit goes through the editor, so the normal change
  // pipeline recomputes the graph and persists the document.
  const handleOverlay = (lineNumber: number, exprText: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const original = editor.getText().split("\n")[lineNumber];
    if (original === undefined) return;
    const next = appendDrawArg(original, exprText);
    if (next === original) return;
    editor.replaceLineRange(lineNumber + 1, lineNumber + 1, next);
  };

  return (
    <div className="ext-shell">
      <main className="ext-main">
        <div ref={containerRef} className="ext-editor" />
        {artifacts.length > 0 && (
          <Suspense fallback={null}>
            <div className="nb2-graphs">
              {artifacts.map((artifact) => (
                <GraphArtifact
                  key={artifact.id}
                  artifact={artifact}
                  candidates={
                    artifact.source === "explicit"
                      ? overlayCandidatesFor(artifact, artifacts)
                      : []
                  }
                  onOverlay={
                    artifact.source === "explicit"
                      ? (expr) => handleOverlay(artifact.lineNumber, expr)
                      : undefined
                  }
                />
              ))}
            </div>
          </Suspense>
        )}
        {/* Clicking the empty space below the document puts the caret in the
            editor. Pointer-only affordance; the editor itself is the
            keyboard-reachable target. */}
        <div
          className="ext-filler"
          aria-hidden="true"
          role="presentation"
          onMouseDown={(e) => {
            e.preventDefault();
            editorRef.current?.focusEditor();
          }}
        />
      </main>
      <footer className="ext-footer">
        <a
          className="ext-brand"
          href={HOME_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/32.png" alt="" width={16} height={16} />
          Hissab
        </a>
        <nav className="ext-links" aria-label="Hissab links">
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            Docs
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </nav>
      </footer>
      {interaction && (
        <Suspense fallback={null}>
          <TokenInteractionPopover
            interaction={interaction}
            onClose={() => setInteraction(null)}
            onCommit={(from, to, text) =>
              editorRef.current?.replaceRange(from, to, text)
            }
          />
        </Suspense>
      )}
    </div>
  );
}
