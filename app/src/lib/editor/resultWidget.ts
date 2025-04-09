import { EditorState, Range, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { getResult, Results } from "@/lib/editor/getResults.ts";
import { chatPrompt, chatPromptEffect } from "@/lib/editor/chatPromptWidget.ts";

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
  async function resultDOM(state: EditorState) {
    const resultWidgets: Range<Decoration>[] = [];
    const results = await getResult(state, storePage, oldResults, isPro);
    oldResults = results;
    results.forEach((res: Results, index: number) => {
      const deco = Decoration.widget({
        widget: new ResultWidget(res, isPro),
        side: 1,
        block: false,
      });
      const { to } = state.doc.line(index + 1);
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

        resultDOM(update.state).then((deco) => {
          update.view.dispatch({
            effects: [
              stateEffect.of({
                decorations: deco,
              }),
              //chatPromptEffect.of({
              //  decorations: chatPrompt(update.state),
              //}),
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

class ResultWidget extends WidgetType {
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

    wrap.className = this.result.stale
      ? "cm-result cm-result-stale"
      : "cm-result cm-result-fresh";
    wrap.innerText = this.result.result;
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
