import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import katex from "katex";
import { debounce } from "lodash-es";
import {
  type ArtifactsDetail,
  CELL_ARTIFACTS_EVENT,
  type CellArtifact,
} from "@/lib/editor/cellArtifacts.ts";
import {
  getResult,
  type Results,
  refreshResults,
} from "@/lib/editor/getResults.ts";
import "katex/dist/katex.min.css";

const resultStateEffect = StateEffect.define<{ decorations: DecorationSet }>(
  {},
);

export const resultStateField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(resultStateEffect)) {
        value = effect.value?.decorations;
      }
    }
    return value;
  },
  provide(f) {
    return EditorView.decorations.from(f);
  },
});

export async function getResultExtension(
  storePage: (content: string) => void,
  oldResults: Results[],
) {
  return ViewPlugin.define(() => {
    // Graphs are heavier than inline results (they sample expressions), so the
    // editor→notebook dispatch is debounced while the user types. Inline text
    // results keep their per-keystroke cadence. One debounced fn per editor.
    const dispatchArtifacts = debounce(
      (view: EditorView, artifacts: CellArtifact[]) => {
        view.dom.dispatchEvent(
          new CustomEvent<ArtifactsDetail>(CELL_ARTIFACTS_EVENT, {
            bubbles: true,
            detail: { artifacts },
          }),
        );
      },
      200,
    );
    return {
      update(update) {
        if (update.docChanged || update.selectionSet) {
          getResult(update.view, storePage, oldResults).then(
            ({ results, artifacts }) => {
              oldResults = results;
              refreshResults(
                results,
                oldResults,
                update.view,
                resultStateEffect,
              );
              dispatchArtifacts(update.view, artifacts);
            },
          );
        }
      },
      destroy() {
        dispatchArtifacts.cancel();
      },
    };
  });
}

export class ResultWidget extends WidgetType {
  constructor(
    readonly result: Results,
    readonly view: EditorView,
  ) {
    super();
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.className = this.result.stale
      ? "cm-result cm-result-stale"
      : "cm-result cm-result-fresh";

    // Engine errors are passed to the agentic harness (via calculateExpressions)
    // but intentionally NOT shown in the editor — on error we just keep the last
    // good/stale result rather than surfacing the error text.
    //
    // Symbolic results carry LaTeX and render with KaTeX; everything else stays
    // plain text. Either way `this.result.result` remains the copy source below.
    if (this.result.latex) {
      try {
        katex.render(this.result.latex, wrap, {
          throwOnError: false,
          displayMode: false,
        });
      } catch {
        wrap.innerText = this.result.result;
      }
    } else if (this.result.kind === "booleanToken") {
      // Boolean results render as a small badge, true/false colour-coded.
      const badge = document.createElement("span");
      const isTrue = this.result.result.trim().toLowerCase() === "true";
      badge.className = `cm-result-bool ${isTrue ? "is-true" : "is-false"}`;
      badge.innerText = this.result.result;
      wrap.appendChild(badge);
    } else if (this.result.kind === "pointToken") {
      // Coordinate points render as a chip.
      const chip = document.createElement("span");
      chip.className = "cm-result-point";
      chip.innerText = this.result.result;
      wrap.appendChild(chip);
    } else {
      wrap.innerText = this.result.result;
    }
    const copiedDiv = document.createElement("div");
    copiedDiv.innerText = "Copied!";
    copiedDiv.className = "copied-div";

    wrap.addEventListener("dblclick", async (e) => {
      e.preventDefault();
      // Copy the plain result string, not wrap.innerText — for KaTeX-rendered
      // results the DOM text includes hidden MathML and would copy garbled.
      await navigator.clipboard.writeText(this.result.result);
      window.getSelection()?.removeAllRanges();
      wrap.appendChild(copiedDiv);
      setTimeout(() => {
        wrap.removeChild(copiedDiv);
      }, 1000);
    });
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("id", `result-element-${this.result.lineNumber}`);
    wrap.setAttribute("title", "Double click to copy answer");

    return wrap;
  }
  ignoreEvent() {
    return true;
  }
}
