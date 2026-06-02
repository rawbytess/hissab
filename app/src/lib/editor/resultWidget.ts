import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import {
  getResult,
  type Results,
  refreshResults,
} from "@/lib/editor/getResults.ts";

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
    return {
      update(update) {
        if (update.docChanged || update.selectionSet) {
          getResult(update.view, storePage, oldResults).then((result) => {
            oldResults = result;
            refreshResults(result, oldResults, update.view, resultStateEffect);
          });
        }
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
    wrap.innerText = this.result.result;
    const copiedDiv = document.createElement("div");
    copiedDiv.innerText = "Copied!";
    copiedDiv.className = "copied-div";

    wrap.addEventListener("dblclick", async (e) => {
      e.preventDefault();
      await navigator.clipboard.writeText(wrap.innerText);
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
