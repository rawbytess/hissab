import {
  EditorState,
  Range,
  StateEffect,
  StateEffectType,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { getResult, Results } from "@/lib/editor/getResults.ts";
import React from "react";
import { sleep } from "../../../../lib/utils.ts";

export async function getResultExtension(
  storePage: (content: string) => void,
  oldResults: Results[],
  isPro: boolean,
) {
  const resultPlugin = StateField.define({
    create() {
      return Decoration.none;
    },
    update(value, tr) {
      for (const effect of tr.effects) {
        if (effect.is(stateEffect)) {
          value = effect.value?.decorations;
        }
      }
      return value;
    },
    provide(f) {
      return EditorView.decorations.from(f);
    },
  });
  async function resultDOM(
    view: EditorView,
    stateEffect: StateEffectType<{ decorations: DecorationSet }>,
    oldDeco: DecorationSet,
  ) {
    const resultWidgets: Range<Decoration>[] = [];
    const results = await getResult(
      view,
      stateEffect,
      oldDeco,
      storePage,
      oldResults,
      isPro,
    );
    oldResults = results;
    results.forEach((res: Results, index: number) => {
      const deco = Decoration.widget({
        widget: new ResultWidget(res, isPro),
        side: 1,
        block: false,
      });
      const { to } = view.state.doc.line(index + 1);
      resultWidgets.push(deco.range(to));
    });
    return Decoration.set(resultWidgets);
  }

  const stateEffect = StateEffect.define<{ decorations: DecorationSet }>({});
  const viewPlugin = ViewPlugin.define(() => {
    return {
      update(update) {
        if (update.state.doc.toString() === update.startState.doc.toString())
          return;
        const oldDeco = update.startState.field(resultPlugin);

        resultDOM(update.view, stateEffect, oldDeco).then((deco) => {
          update.view.dispatch({
            effects: [
              stateEffect.of({
                decorations: deco,
              }),
            ],
          });
        });
      },
    };
  });
  return { viewPlugin, resultPlugin };
}

const copiedDiv = document.createElement("div");
copiedDiv.innerText = "Copied!";
copiedDiv.className = "copied-div";

export class ResultWidget extends WidgetType {
  constructor(
    readonly result: Results,
    readonly pro: boolean,
  ) {
    super();
  }

  toDOM() {
    const wrap = document.createElement("span");
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
    /* if (this.result.ai) {
      const aiSpan = document.createElement("span");
      aiSpan.setAttribute("id", `result-ai-${this.result.lineNumber}`);
      wrap.appendChild(aiSpan);
      aiSpan.innerHTML = "<img src='../resources/ai.png' alt='AI'/>";
      aiSpan.className = "ai-span";
      this.result.ai.expressions.forEach((expression) => {
        const expressionSpan = document.createElement("span");
        expressionSpan.innerText = expression;
        expressionSpan.className = "ai-expression";
        aiSpan.appendChild(expressionSpan);
      });
    } */
    if (this.result.loading) {
      const loadingSpan = document.createElement("button");
      loadingSpan.setAttribute(
        "id",
        `result-loading-${this.result.lineNumber}`,
      );
      sleep(50).then(() => {
        //wrap.insertBefore(loadingSpan, wrap.firstChild);
        wrap.appendChild(loadingSpan);
        loadingSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
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
        loadingSpan.className = "cm-ai-span";
      });
    }
    if (this.result.ai) {
      const aiSpan = document.createElement("button");
      const title = `Hissab Expressions: 
${this.result.ai.expressions.join("\n")}
Double click to copy expressions`;
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
      aiSpan.setAttribute("title", title);
      aiSpan.setAttribute("id", `result-ai-${this.result.lineNumber}`);
      wrap.appendChild(aiSpan);
      aiSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path fill="currentColor" d="M4.25 12a7.75 7.75 0 1 1 15.5 0a7.75 7.75 0 0 1-15.5 0" opacity="0.5"/>
        <path fill="currentColor" d="M8.25 12a3.75 3.75 0 1 0 7.5 0a3.75 3.75 0 0 0-7.5 0"/></svg>`;
      aiSpan.className = "cm-ai-span";
    }

    if (
      this.pro &&
      this.result.error &&
      this.result.errorMessage?.name === "ReportError"
    ) {
      const errorSpan = document.createElement("span");
      errorSpan.setAttribute("id", `result-error-${this.result.lineNumber}`);
      wrap.appendChild(errorSpan);
      errorSpan.innerHTML = "<img src='../resources/caution.png' alt='error'/>";
      errorSpan.className = "error-span";

      const errortip = document.createElement("span");
      errortip.setAttribute("id", `result-tip-${this.result.lineNumber}`);
      errorSpan.appendChild(errortip);
      errortip.innerText = this.result.errorMessage.message;
      errortip.className = "error-tip";
    }
    return wrap;
  }
  ignoreEvent() {
    return true;
  }
}
