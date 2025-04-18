import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { getResult, refreshResults, Results } from "@/lib/editor/getResults.ts";
import { sleep } from "../../../../lib/utils.ts";
import { aicache } from "@/lib/cache.ts";

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
  isPro: boolean,
) {
  return ViewPlugin.define(() => {
    return {
      update(update) {
        if (update.docChanged || update.selectionSet) {
          getResult(
            update.view,
            resultStateEffect,
            storePage,
            oldResults,
            isPro,
          ).then((result) => {
            oldResults = result;
            refreshResults(
              result,
              oldResults,
              update.view,
              resultStateEffect,
              isPro,
            );
          });
        }
      },
    };
  });
}

export class ResultWidget extends WidgetType {
  constructor(
    readonly result: Results,
    readonly pro: boolean,
    readonly view: EditorView,
  ) {
    super();
  }

  toDOM() {
    const wrap = document.createElement("span");

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

    wrap.className = this.result.stale
      ? "cm-result cm-result-stale"
      : "cm-result cm-result-fresh";
    wrap.innerText = this.result.result;

    if (this.result.loading) {
      const loadingSpan = document.createElement("button");
      loadingSpan.setAttribute(
        "id",
        `result-loading-${this.result.lineNumber}`,
      );
      sleep(50).then(() => {
        wrap.appendChild(loadingSpan);
        loadingSpan.innerHTML = loadingIcon;
        loadingSpan.className = "cm-ai-span";
      });
    }
    if (this.result.ai) {
      const aiSpan = document.createElement("button");

      const title = `Hissab Expressions: 
${this.result.ai.expressions.join("\n")}
Double click to copy expressions`;
      aiSpan.setAttribute("title", title);
      aiSpan.addEventListener("dblclick", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(
          this.result.ai?.expressions.join("\n") || "",
        );
        window.getSelection()?.removeAllRanges();
        wrap.appendChild(copiedDiv);
        setTimeout(() => {
          wrap.removeChild(copiedDiv);
        }, 1000);
      });

      aiSpan.setAttribute("id", `result-ai-${this.result.lineNumber}`);
      wrap.appendChild(aiSpan);
      aiSpan.innerHTML = aiIcon;
      aiSpan.className = "cm-ai-span";
    }

    if (this.result.error && this.result.errorMessage?.name !== "UserError") {
      const errorSpan = document.createElement("span");
      errorSpan.setAttribute("id", `result-error-${this.result.lineNumber}`);
      wrap.appendChild(errorSpan);
      errorSpan.innerHTML = `<span>${this.result.errorMessage ?? "Something went wrong"}</span> <span>${errorIcon}</span>`;
      errorSpan.className = "error-span";
      //errorSpan.ariaLabel = `Double click to try again.`;
      errorSpan.title = `Double click to try again.`;
      errorSpan.addEventListener("dblclick", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.getSelection()?.removeAllRanges();
        const currentLine = this.view.state.doc.toString().split("\n")[
          this.result.lineNumber
        ];
        const current = this.view.state.selection.main.head;
        const currentLn = this.view.state.doc.lineAt(current);
        const aiPrompt = currentLine.trim().substring(2).trim();

        aicache.delete(aiPrompt);
        this.view.dispatch({
          selection: { anchor: currentLn.to + 1 },
        });
      });
    }
    return wrap;
  }
  ignoreEvent() {
    return true;
  }
}

const loadingIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<circle cx="12" cy="12" r="0" fill="currentColor">
<animate id="svgSpinnersPulseMultiple0" fill="freeze" attributeName="r" begin="0;svgSpinnersPulseMultiple2.end" 
calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="0;11"/><animate fill="freeze" attributeName="opacity" 
begin="0;svgSpinnersPulseMultiple2.end" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="1;0"/></circle>
<circle cx="12" cy="12" r="0" fill="currentColor"><animate id="svgSpinnersPulseMultiple1" fill="freeze" attributeName="r" 
begin="svgSpinnersPulseMultiple0.begin+0.2s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="0;11"/>
<animate fill="freeze" attributeName="opacity" begin="svgSpinnersPulseMultiple0.begin+0.2s" calcMode="spline" dur="1.2s" 
keySplines=".52,.6,.25,.99" values="1;0"/></circle><circle cx="12" cy="12" r="0" fill="currentColor">
<animate id="svgSpinnersPulseMultiple2" fill="freeze" attributeName="r" begin="svgSpinnersPulseMultiple0.begin+0.4s" 
calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="0;11"/><animate fill="freeze" attributeName="opacity" 
begin="svgSpinnersPulseMultiple0.begin+0.4s" calcMode="spline" dur="1.2s" keySplines=".52,.6,.25,.99" values="1;0"/></circle></svg>`;

const aiIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path fill="currentColor" d="M4.25 12a7.75 7.75 0 1 1 15.5 0a7.75 7.75 0 0 1-15.5 0" opacity="0.5"/>
<path fill="currentColor" d="M8.25 12a3.75 3.75 0 1 0 7.5 0a3.75 3.75 0 0 0-7.5 0"/></svg>`;

const errorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path fill="red" d="M4.25 12a7.75 7.75 0 1 1 15.5 0a7.75 7.75 0 0 1-15.5 0" opacity="0.5"/>
<path fill="red" d="M8.25 12a3.75 3.75 0 1 0 7.5 0a3.75 3.75 0 0 0-7.5 0"/></svg>`;
